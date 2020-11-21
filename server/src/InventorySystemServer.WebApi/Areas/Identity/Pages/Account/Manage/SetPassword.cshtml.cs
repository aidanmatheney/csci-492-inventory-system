namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account.Manage
{
    using System.ComponentModel.DataAnnotations;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

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
            Guard.NotNull(signInManager, nameof(signInManager));
            _signInManager = signInManager;
        }

        [BindProperty]
        public InputModel? Input { get; set; }

        [TempData]
        public string? StatusMessage { get; set; }

        public sealed class InputModel
        {
            [Required]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "New password")]
            public string? NewPassword { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Confirm new password")]
            [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
            public string? ConfirmPassword { get; set; }
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var user = await UserManager.GetUserAsync(User);
            if (user is null)
            {
                return NotFound($"Unable to load user with ID '{UserManager.GetUserId(User)}'.");
            }

            var hasPassword = await UserManager.HasPasswordAsync(user);
            if (hasPassword)
            {
                return RedirectToPage("./ChangePassword");
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var user = await UserManager.GetUserAsync(User);
            if (user is null)
            {
                return NotFound($"Unable to load user with ID '{UserManager.GetUserId(User)}'.");
            }

            var addPasswordResult = await UserManager.AddPasswordAsync(user, Input!.NewPassword);
            if (!addPasswordResult.Succeeded)
            {
                foreach (var error in addPasswordResult.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }

                return Page();
            }

            await _signInManager.RefreshSignInAsync(user);
            StatusMessage = "Your password has been set.";

            return RedirectToPage();
        }
    }
}