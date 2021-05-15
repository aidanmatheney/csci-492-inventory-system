namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.ComponentModel.DataAnnotations;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    using Dawn;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.WebUtilities;
    using Microsoft.Extensions.Logging;

    public sealed class ConfirmEmailModel : AppPageModelBase
    {
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ApiClientsSettings _apiClientsSettings;

        public ConfirmEmailModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            SignInManager<AppUser> signInManager,
            ApiClientsSettings apiClientsSettings,
            ILogger<ConfirmEmailModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.Argument(signInManager, nameof(signInManager)).NotNull();
            Guard.Argument(apiClientsSettings, nameof(apiClientsSettings)).NotNull();

            _signInManager = signInManager;
            _apiClientsSettings = apiClientsSettings;
        }

        [BindProperty]
        public InputModel Input { get; set; } = new();

        public sealed class InputModel
        {
            [Required]
            [StringLength(100, ErrorMessage = "{0} must be at least {2} and at max {1} characters long.", MinimumLength = 8)]
            [DataType(DataType.Password)]
            [Display(Name = "Password")]
            public string Password { get; set; } = "";

            [DataType(DataType.Password)]
            [Display(Name = "Confirm password")]
            [Compare(nameof(Password), ErrorMessage = "Password and confirmation password do not match.")]
            public string ConfirmPassword { get; set; } = "";
        }

        public async Task<ActionResult> OnGetAsync(string? userId, string? code)
        {
            if (userId is null || code is null || AppUserIsAuthenticated)
            {
                return Redirect(_apiClientsSettings.WebAppBaseUrl);
            }

            var appUser = await UserManager.FindByIdAsync(userId).ConfigureAwait(false);
            if (appUser is null)
            {
                return NotFound($"User {userId} not found");
            }

            if (appUser.EmailConfirmed && appUser.HasPassword)
            {
                return RedirectToPage("./SignIn");
            }

            return Page();
        }

        public async Task<ActionResult> OnPostAsync(string? userId, string? code)
        {
            if (userId is null || code is null || AppUserIsAuthenticated)
            {
                return Redirect(_apiClientsSettings.WebAppBaseUrl);
            }

            var appUser = await UserManager.FindByIdAsync(userId).ConfigureAwait(false);
            if (appUser is null)
            {
                return NotFound($"User {userId} not found");
            }

            if (appUser.EmailConfirmed && appUser.HasPassword)
            {
                return RedirectToPage("./SignIn");
            }

            if (!ModelState.IsValid)
            {
                return Page();
            }

            var confirmEmailToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
            var confirmEmailResult = await UserManager.ConfirmEmailAsync(appUser, confirmEmailToken).ConfigureAwait(false);
            if (!confirmEmailResult.Succeeded)
            {
                var errors = confirmEmailResult.Errors.ToList();
                if (errors.Count == 1 && errors[0].Code == "InvalidToken")
                {
                    Logger.LogDebug("App user {appUserEmail} attempted to confirm email with invalid token.", appUser.Email);
                    ModelState.AddModelError("", "Your account creation code has expired. Please request another invitation.");
                }
                else
                {
                    Logger.LogDebug("Failed to confirm email for app user {email}. Result: {result}", appUser.Email, confirmEmailResult);
                    foreach (var error in errors)
                    {
                        ModelState.AddModelError("", error.Description);
                    }
                }

                return Page();
            }

            var addPasswordResult = await UserManager.AddPasswordAsync(appUser, Input!.Password).ConfigureAwait(false);
            if (!addPasswordResult.Succeeded)
            {
                Logger.LogDebug("Failed to add password when confirming email for app user {email}. Result: {result}", appUser.Email, addPasswordResult);
                foreach (var error in addPasswordResult.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }

                return Page();
            }

            await _signInManager.SignInAsync(appUser, false).ConfigureAwait(false);

            Logger.LogDebug("App user {email} confirmed their email address", appUser.Email);

            return Redirect(_apiClientsSettings.WebAppBaseUrl);
        }
    }
}