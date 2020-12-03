namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.ComponentModel.DataAnnotations;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    public sealed class SignInModel : AppPageModelBase
    {
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ApiClientsSettings _apiClientsSettings;

        public SignInModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            SignInManager<AppUser> signInManager,
            ApiClientsSettings apiClientsSettings,
            ILogger<SignInModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(signInManager, nameof(signInManager));
            Guard.NotNull(apiClientsSettings, nameof(apiClientsSettings));

            _signInManager = signInManager;
            _apiClientsSettings = apiClientsSettings;
        }

        [BindProperty]
        public InputModel Input { get; set; } = new();

        public string? ReturnUrl { get; set; }

        [TempData]
        public string? ErrorMessage { get; set; }

        public sealed class InputModel
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; } = "";

            [Required]
            [DataType(DataType.Password)]
            public string Password { get; set; } = "";

            [Display(Name = "Remember me?")]
            public bool RememberMe { get; set; } = false;
        }

        public ActionResult OnGetAsync(string? returnUrl = null)
        {
            if (AppUserIsAuthenticated)
            {
                if (returnUrl is not null)
                {
                    return LocalRedirect(returnUrl);
                }
                return Redirect(_apiClientsSettings.WebAppBaseUrl);
            }

            if (!string.IsNullOrEmpty(ErrorMessage))
            {
                ModelState.AddModelError("", ErrorMessage);
            }

            ReturnUrl = returnUrl;

            return Page();
        }

        public async Task<ActionResult> OnPostAsync(string? returnUrl = null)
        {
            if (AppUserIsAuthenticated)
            {
                if (returnUrl is not null)
                {
                    return LocalRedirect(returnUrl);
                }
                return Redirect(_apiClientsSettings.WebAppBaseUrl);
            }

            if (!ModelState.IsValid)
            {
                return Page();
            }

            var appUser = await UserManager.FindByEmailAsync(Input!.Email).ConfigureAwait(false);
            if (appUser is null)
            {
                ModelState.AddModelError("", "Incorrect email or password.");
                return Page();
            }

            // This doesn't count sign-in failures towards account lockout
            // To enable password failures to trigger account lockout, set lockoutOnFailure: true
            var signInResult = await _signInManager.PasswordSignInAsync(Input.Email, Input.Password, Input.RememberMe, lockoutOnFailure: false).ConfigureAwait(false);
            if (!signInResult.Succeeded)
            {
                if (signInResult.IsLockedOut)
                {
                    Logger.LogDebug("App user {appUserEmail} tried to sign in, but their account is locked out.", appUser.Email);
                    return RedirectToPage("./Lockout");
                }

                if (!appUser.EmailConfirmed)
                {
                    Logger.LogDebug("App user {appUserEmail} tried to sign in, but their email is not confirmed", appUser.Email);
                    ModelState.AddModelError("", "Unconfirmed email address. Check your email for an invitation link.");
                }
                else if (!appUser.HasPassword)
                {
                    Logger.LogDebug("App user {appUserEmail} tried to sign in, but their account has no password", appUser.Email);
                    ModelState.AddModelError("", "Account has no password. Use \"Forgot your password?\" to create a password.");
                }
                else
                {
                    Logger.LogDebug("App user {appUserEmail} tried to sign in, but the password was incorrect", appUser.Email);
                    ModelState.AddModelError("", "Incorrect email or password.");
                }

                return Page();
            }

            Logger.LogDebug("App user {appUserEmail} signed in", appUser.Email);

            if (returnUrl is not null)
            {
                return LocalRedirect(returnUrl);
            }
            return Redirect(_apiClientsSettings.WebAppBaseUrl);
        }
    }
}