namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account.Manage
{
    using System.ComponentModel.DataAnnotations;
    using System.Threading.Tasks;

    using Dawn;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [Authorize]
    public sealed class SetPasswordModel : AppPageModelBase
    {
        private readonly SignInManager<AppUser> _signInManager;

        public SetPasswordModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            SignInManager<AppUser> signInManager,
            ILogger<SetPasswordModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.Argument(signInManager, nameof(signInManager)).NotNull();
            _signInManager = signInManager;
        }

        public string? Email { get; set; }

        [BindProperty]
        public InputModel Input { get; set; } = new();

        [TempData]
        public string? StatusMessage { get; set; }

        public sealed class InputModel
        {
            [Required]
            [StringLength(100, ErrorMessage = "{0} must be at least {2} and at max {1} characters long.", MinimumLength = 8)]
            [DataType(DataType.Password)]
            [Display(Name = "New password")]
            public string NewPassword { get; set; } = "";

            [DataType(DataType.Password)]
            [Display(Name = "Confirm new password")]
            [Compare(nameof(NewPassword), ErrorMessage = "New password and confirmation password do not match.")]
            public string ConfirmPassword { get; set; } = "";
        }

        public async Task<ActionResult> OnGetAsync()
        {
            var appUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);

            if (appUser.HasPassword)
            {
                return RedirectToPage("./ChangePassword");
            }

            Email = appUser.Email;

            return Page();
        }

        public async Task<ActionResult> OnPostAsync()
        {
            var appUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);

            if (appUser.HasPassword)
            {
                return RedirectToPage("./ChangePassword");
            }

            if (!ModelState.IsValid)
            {
                return Page();
            }

            var addPasswordResult = await UserManager.AddPasswordAsync(appUser, Input!.NewPassword).ConfigureAwait(false);
            if (!addPasswordResult.Succeeded)
            {
                Logger.LogDebug("Failed to add password to app user {appUserEmail}. Result: {result}", appUser.Email, addPasswordResult);
                foreach (var error in addPasswordResult.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }

                return Page();
            }

            await _signInManager.RefreshSignInAsync(appUser).ConfigureAwait(false);

            Logger.LogDebug("App user {appUserEmail} added a password", appUser.Email);
            StatusMessage = "Your password has been set.";

            return RedirectToPage();
        }
    }
}