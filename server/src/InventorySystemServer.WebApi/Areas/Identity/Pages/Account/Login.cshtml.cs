namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Linq;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.Authentication;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [AllowAnonymous]
    public sealed class LoginModel : AppPageModelBase
    {
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ApiClientsSettings _apiClientsSettings;

        public LoginModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            SignInManager<AppUser> signInManager,
            ApiClientsSettings apiClientsSettings,
            ILogger<LoginModel> logger
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
        public InputModel? Input { get; set; }

        public string? ReturnUrl { get; set; }

        [TempData]
        public string? ErrorMessage { get; set; }

        public sealed class InputModel
        {
            [Required]
            [EmailAddress]
            public string? Email { get; set; }

            [Required]
            [DataType(DataType.Password)]
            public string? Password { get; set; }

            [Display(Name = "Remember me?")]
            public bool RememberMe { get; set; }
        }

        public async Task OnGetAsync(string? returnUrl = null)
        {
            if (!string.IsNullOrEmpty(ErrorMessage))
            {
                ModelState.AddModelError(string.Empty, ErrorMessage);
            }

            // Clear the existing external cookie to ensure a clean login process
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

            ReturnUrl = returnUrl;
        }

        public async Task<IActionResult> OnPostAsync(string? returnUrl = null)
        {
            if (ModelState.IsValid)
            {
                // This doesn't count login failures towards account lockout
                // To enable password failures to trigger account lockout, set lockoutOnFailure: true
                var result = await _signInManager.PasswordSignInAsync(Input!.Email, Input.Password, Input.RememberMe, lockoutOnFailure: false);
                if (result.Succeeded)
                {
                    Logger.LogInformation("User logged in.");
                    if (returnUrl is not null)
                    {
                        return LocalRedirect(returnUrl);
                    }
                    return Redirect(_apiClientsSettings.WebAppBaseUrl);
                }

                if (result.IsLockedOut)
                {
                    Logger.LogWarning("User account locked out.");
                    return RedirectToPage("./Lockout");
                }

                ModelState.AddModelError(string.Empty, "Invalid login attempt.");
                return Page();
            }

            // If we got this far, something failed, redisplay form
            return Page();
        }
    }
}