namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account.Manage
{
    using System.ComponentModel.DataAnnotations;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [Authorize]
    public sealed class ChangePasswordModel : AppPageModelBase
    {
        private readonly SignInManager<AppUser> _signInManager;

        public ChangePasswordModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            SignInManager<AppUser> signInManager,
            ILogger<ChangePasswordModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(signInManager, nameof(signInManager));
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
            [DataType(DataType.Password)]
            [Display(Name = "Current password")]
            public string OldPassword { get; set; } = "";

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

            if (!appUser.HasPassword)
            {
                return RedirectToPage("./SetPassword");
            }

            Email = appUser.Email;

            return Page();
        }

        public async Task<ActionResult> OnPostAsync()
        {
            var appUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);

            if (!appUser.HasPassword)
            {
                return RedirectToPage("./SetPassword");
            }

            if (!ModelState.IsValid)
            {
                return Page();
            }

            var changePasswordResult = await UserManager.ChangePasswordAsync(appUser, Input!.OldPassword, Input.NewPassword).ConfigureAwait(false);
            if (!changePasswordResult.Succeeded)
            {
                Logger.LogDebug("Failed to change password for app user {appUserEmail}. Result: {result}", appUser.Email, changePasswordResult);
                foreach (var error in changePasswordResult.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }

                return Page();
            }

            await _signInManager.RefreshSignInAsync(appUser).ConfigureAwait(false);

            Logger.LogDebug("App user {appUserEmail} changed their password", appUser.Email);
            StatusMessage = "Your password has been changed.";

            return RedirectToPage();
        }
    }
}