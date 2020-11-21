namespace InventorySystemServer.WebApi.Areas.Api.Controllers
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Data.Services;
    using InventorySystemServer.Utils;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [Authorize]
    public sealed class AppUserController : ApiAreaControllerBase
    {
        private readonly IAppUserService _appUserService;

        public AppUserController
        (
            IAppUserService appUserService,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<AppUserController> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(appUserService, nameof(appUserService));
            _appUserService = appUserService;
        }

        public sealed class GetCurrentAppUserInfoResponse
        {
            public string Id { get; set; } = null!;
            public string Email { get; set; } = null!;
            public string Name { get; set; } = null!;
            public IReadOnlyList<string> Roles { get; set; } = null!;
        }

        [HttpGet("CurrentAppUserInfo")]
        public async Task<GetCurrentAppUserInfoResponse> GetCurrentAppUserInfo(CancellationToken cancellationToken)
        {
            var appUser = (await _appUserService.FindAppUserByIdAsync(AuthenticatedAppUserId, cancellationToken).ConfigureAwait(false))!;
            var appRoles = await _appUserService.FindAppUserRolesByIdAsync(AuthenticatedAppUserId, cancellationToken).ConfigureAwait(false);

            return new GetCurrentAppUserInfoResponse
            {
                Id = appUser.Id,
                Email = appUser.Email,
                Name = appUser.UserName,
                Roles = appRoles.Select(appRole => appRole.Name).ToList()
            };
        }
    }
}