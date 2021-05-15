namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.ComponentModel.DataAnnotations;
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

    public sealed class ResetPasswordModel : AppPageModelBase
    {
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ApiClientsSettings _apiClientsSettings;

        public ResetPasswordModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            SignInManager<AppUser> signInManager,
            ApiClientsSettings apiClientsSettings,
            ILogger<ResetPasswordModel> logger
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
            [EmailAddress]
            public string Email { get; set; } = "";

            [Required]
            [StringLength(100, ErrorMessage = "{0} must be at least {2} and at max {1} characters long.", MinimumLength = 8)]
            [DataType(DataType.Password)]
            public string Password { get; set; } = "";

            [DataType(DataType.Password)]
            [Display(Name = "Confirm password")]
            [Compare(nameof(Password), ErrorMessage = "Password and confirmation password do not match.")]
            public string ConfirmPassword { get; set; } = "";
        }

        public ActionResult OnGet(string? code = null)
        {
            if (code is null || AppUserIsAuthenticated)
            {
                return Redirect(_apiClientsSettings.WebAppBaseUrl);
            }

            return Page();
        }

        public async Task<ActionResult> OnPostAsync(string? code = null)
        {
            if (code is null || AppUserIsAuthenticated)
            {
                return Redirect(_apiClientsSettings.WebAppBaseUrl);
            }

            if (!ModelState.IsValid)
            {
                return Page();
            }

            var appUser = await UserManager.FindByEmailAsync(Input!.Email).ConfigureAwait(false);
            if (appUser is null)
            {
                // Don't reveal that the user does not exist
                return RedirectToPage("./ResetPasswordConfirmation");
            }

            var resetPasswordToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
            var resetPasswordResult = await UserManager.ResetPasswordAsync(appUser, resetPasswordToken, Input.Password).ConfigureAwait(false);
            if (!resetPasswordResult.Succeeded)
            {
                Logger.LogDebug("Failed to reset password for app user {appUserEmail}. Result: {result}", appUser.Email, resetPasswordResult);
                foreach (var error in resetPasswordResult.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }

                return Page();
            }

            await _signInManager.SignInAsync(appUser, false).ConfigureAwait(false);

            Logger.LogDebug("App user {email} reset their password", appUser.Email);

            return Redirect(_apiClientsSettings.WebAppBaseUrl);
        }
    }
}