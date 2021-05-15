namespace InventorySystemServer.WebApi.Areas.Api.Controllers
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Text.Encodings.Web;
    using System.Threading;
    using System.Threading.Tasks;

    using Dawn;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Data.Services;
    using InventorySystemServer.Services;
    using InventorySystemServer.WebApi.Authorization;
    using InventorySystemServer.WebApi.Dto;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.WebUtilities;
    using Microsoft.Extensions.Logging;

    [RequireAdministratorRole]
    public sealed class AppUsersController : ApiAreaControllerBase
    {
        private readonly IAppUserService _appUserService;
        private readonly IAppRoleService _appRoleService;
        private readonly IEmailSender _emailSender;

        public AppUsersController
        (
            IAppUserService appUserService,
            IAppRoleService appRoleService,
            IEmailSender emailSender,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<AppUsersController> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.Argument(appUserService, nameof(appUserService)).NotNull();
            Guard.Argument(appRoleService, nameof(appRoleService)).NotNull();
            Guard.Argument(emailSender, nameof(emailSender)).NotNull();

            _appUserService = appUserService;
            _appRoleService = appRoleService;
            _emailSender = emailSender;
        }

        [HttpGet]
        public async Task<IReadOnlyList<OtherAppUserDto>> GetAll(CancellationToken cancellationToken)
        {
            var appUsers = await _appUserService.GetAllAppUsersAsync(cancellationToken).ConfigureAwait(false);
            return await appUsers.ToAsyncEnumerable()
                .SelectAwait(async appUser =>
                {
                    var appRoles = await _appUserService.GetAppUserRolesAsync(appUser, cancellationToken).ConfigureAwait(false);
                    return new OtherAppUserDto
                    {
                        Id = appUser.Id,
                        Email = appUser.Email,
                        Name = appUser.Email,
                        EmailConfirmed = appUser.EmailConfirmed,
                        HasPassword = appUser.HasPassword,
                        LockedOut = appUser.LockedOut,
                        AppRoles = appRoles.Select(appRole => appRole.Name).ToList()
                    };
                })
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public sealed class CreateRequest
        {
            public string Email { get; set; } = null!;
            public string Name { get; set; } = null!;
            public IReadOnlyList<string> AppRoles { get; set; } = null!;
        }

        public sealed class CreateResponse
        {
            public string NewAppUserId { get; set; } = null!;
            public string EmailConfirmationUrl { get; set; } = null!;
        }

        [HttpPost]
        public async Task<ActionResult<CreateResponse>> Create(CreateRequest request, CancellationToken cancellationToken)
        {
            foreach (var desiredAppRoleName in request.AppRoles)
            {
                var desiredAppRole = await _appRoleService.FindAppRoleByNameAsync(desiredAppRoleName, cancellationToken).ConfigureAwait(false);
                if (desiredAppRole is null)
                {
                    return BadRequest($"Role {desiredAppRole} not found");
                }
            }

            var newAppUser = new AppUser
            {
                Email = request.Email,
                UserName = request.Email
                // TODO: name
            };
            var createAppUserResult = await UserManager.CreateAsync(newAppUser).ConfigureAwait(false);
            if (!createAppUserResult.Succeeded)
            {
                Logger.LogDebug("Failed to create app user {appUserEmail}. Result: {result}", newAppUser.Email, createAppUserResult);
                return BadRequest(createAppUserResult.Errors);
            }

            var addToRolesResult = await UserManager.AddToRolesAsync(newAppUser, request.AppRoles).ConfigureAwait(false);
            if (!addToRolesResult.Succeeded)
            {
                Logger.LogDebug("Failed to add new app user {appUserEmail} to roles. Result: {result}", newAppUser.Email, addToRolesResult);
                return BadRequest(addToRolesResult.Errors);
            }

            var confirmEmailUrl = await GenerateConfirmEmailUrl(newAppUser, cancellationToken).ConfigureAwait(false);
            await _emailSender.SendEmailAsync
            (
                newAppUser.Email,
                "Confirm Email - Inventory System",
                $"Please confirm your email address by <a href='{HtmlEncoder.Default.Encode(confirmEmailUrl)}'>clicking here</a>.",
                cancellationToken
            ).ConfigureAwait(false);

            Logger.LogDebug("Created new app user {appUserEmail}", newAppUser.Email);

            return new CreateResponse
            {
                NewAppUserId = newAppUser.Id,
                EmailConfirmationUrl = confirmEmailUrl
            };
        }

        public sealed class UpdateRequest
        {
            public string Name { get; set; } = null!;
            public bool LockedOut { get; set; }
            public IReadOnlyList<string> AppRoles { get; set; } = null!;
        }

        [HttpPut("{appUserId}")]
        public async Task<ActionResult> Update(string appUserId, UpdateRequest request, CancellationToken cancellationToken)
        {
            var editAppUser = await _appUserService.FindAppUserByIdAsync(appUserId, cancellationToken).ConfigureAwait(false);
            if (editAppUser is null)
            {
                return NotFound($"User {appUserId} not found");
            }

            var desiredEditAppUserAppRoleNames = request.AppRoles.ToHashSet();
            foreach (var desiredAppRoleName in desiredEditAppUserAppRoleNames)
            {
                var desiredAppRole = await _appRoleService.FindAppRoleByNameAsync(desiredAppRoleName, cancellationToken).ConfigureAwait(false);
                if (desiredAppRole is null)
                {
                    return BadRequest($"Role {desiredAppRole} not found");
                }
            }

            var currentEditAppUserRoleNames = (
                await _appUserService.GetAppUserRolesAsync(editAppUser, cancellationToken).ConfigureAwait(false)
            ).Select(appRole => appRole.Name).ToHashSet();

            var appRolesNamesToAdd = desiredEditAppUserAppRoleNames.Except(currentEditAppUserRoleNames).ToHashSet();
            var appRolesNamesToRemove = currentEditAppUserRoleNames.Except(desiredEditAppUserAppRoleNames).ToHashSet();

            var currentAppUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);
            if (currentAppUser.Id == editAppUser.Id)
            {
                if (request.LockedOut)
                {
                    return BadRequest("You may not lock yourself out");
                }

                if (appRolesNamesToRemove.Contains(AppRoleName.Administrator))
                {
                    return BadRequest("You may not remove your own administrator permissions");
                }
            }

            // TODO: set name

            var lockOutResult = await UserManager.LockOutAsync(editAppUser, request.LockedOut).ConfigureAwait(false);
            if (lockOutResult?.Succeeded == false)
            {
                Logger.LogDebug($"Failed to {(request.LockedOut ? "" : "un")}lock-out app user {{appUserEmail}}. Result: {{result}}", editAppUser.Email, lockOutResult);
                return BadRequest(lockOutResult.Errors);
            }

            if (appRolesNamesToAdd.Any() || appRolesNamesToRemove.Any())
            {
                var addToRolesResult = await UserManager.AddToRolesAsync(editAppUser, appRolesNamesToAdd).ConfigureAwait(false);
                if (!addToRolesResult.Succeeded)
                {
                    Logger.LogDebug("Failed to add app user {appUserEmail} to roles. Result: {result}", editAppUser.Email, addToRolesResult);
                    return BadRequest(addToRolesResult.Errors);
                }

                var removeFromRolesResult = await UserManager.RemoveFromRolesAsync(editAppUser, appRolesNamesToRemove).ConfigureAwait(false);
                if (!removeFromRolesResult.Succeeded)
                {
                    Logger.LogDebug("Failed to remove app user {appUserEmail} from roles. Result: {result}", editAppUser.Email, removeFromRolesResult);
                    return BadRequest(removeFromRolesResult.Errors);
                }

                await UserManager.UpdateSecurityStampAsync(editAppUser).ConfigureAwait(false);
            }

            await UserManager.UpdateAsync(editAppUser).ConfigureAwait(false);

            Logger.LogDebug("Updated app user {appUserEmail}", editAppUser.Email);

            return Ok();
        }

        [HttpDelete("{appUserId}")]
        public async Task<ActionResult> Delete(string appUserId, CancellationToken cancellationToken)
        {
            var editAppUser = await _appUserService.FindAppUserByIdAsync(appUserId, cancellationToken).ConfigureAwait(false);
            if (editAppUser is null)
            {
                return NotFound($"User {appUserId} not found");
            }

            var currentAppUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);
            if (currentAppUser.Id == editAppUser.Id)
            {
                return BadRequest("You may not delete yourself");
            }

            await _appUserService.DeleteAppUserAsync(editAppUser, cancellationToken).ConfigureAwait(false);

            Logger.LogDebug("Deleted app user {appUserEmail}", editAppUser.Email);

            return Ok();
        }

        public sealed class ResendEmailConfirmationResponse
        {
            public string EmailConfirmationUrl { get; set; } = null!;
        }

        [HttpPost("{appUserId}/ResendEmailConfirmation")]
        public async Task<ActionResult<ResendEmailConfirmationResponse>> ResendEmailConfirmation(string appUserId, CancellationToken cancellationToken)
        {
            var appUser = await _appUserService.FindAppUserByIdAsync(appUserId, cancellationToken).ConfigureAwait(false);
            if (appUser is null)
            {
                return NotFound($"User {appUserId} not found");
            }

            if (appUser.EmailConfirmed)
            {
                return BadRequest("The user's email is already confirmed");
            }

            var emailConfirmationUrl = await GenerateConfirmEmailUrl(appUser, cancellationToken).ConfigureAwait(false);
            await _emailSender.SendEmailAsync(appUser.Email, "Confirm Your Email - Inventory System", emailConfirmationUrl, cancellationToken).ConfigureAwait(false);

            Logger.LogDebug("Resent email confirmation to app user {appUserEmail}", appUser.Email);

            return new ResendEmailConfirmationResponse
            {
                EmailConfirmationUrl = emailConfirmationUrl
            };
        }

        [HttpDelete("{appUserId}/Password")]
        public async Task<ActionResult> RemovePassword(string appUserId, CancellationToken cancellationToken)
        {
            var editAppUser = await _appUserService.FindAppUserByIdAsync(appUserId, cancellationToken).ConfigureAwait(false);
            if (editAppUser is null)
            {
                return NotFound($"User {appUserId} not found");
            }

            var currentAppUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);
            if (currentAppUser.Id == editAppUser.Id)
            {
                return BadRequest("You may not remove your own password");
            }

            if (!editAppUser.HasPassword)
            {
                return BadRequest("The user has no password");
            }

            var removePasswordResult = await UserManager.RemovePasswordAsync(editAppUser).ConfigureAwait(false);
            if (!removePasswordResult.Succeeded)
            {
                Logger.LogDebug("Failed to remove app user {appUserEmail}'s password. Result: {result}", editAppUser.Email, removePasswordResult);
                return BadRequest(removePasswordResult.Errors);
            }

            Logger.LogDebug("Removed app user {appUserEmail}'s password", editAppUser.Email);

            return Ok();
        }

        private async Task<string> GenerateConfirmEmailUrl(AppUser appUser, CancellationToken cancellationToken)
        {
            var confirmEmailToken = await UserManager.GenerateEmailConfirmationTokenAsync(appUser).ConfigureAwait(false);
            var confirmEmailCode = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(confirmEmailToken));
            var confirmEmailUrl = Url.Page
            (
                "/Account/ConfirmEmail",
                pageHandler: null,
                values: new
                {
                    area = "Identity",
                    userId = appUser.Id,
                    code = confirmEmailCode
                },
                protocol: Request.Scheme
            );
            return confirmEmailUrl;
        }
    }
}