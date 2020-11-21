namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.Text;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.WebUtilities;
    using Microsoft.Extensions.Logging;

    [AllowAnonymous]
    public sealed class ConfirmEmailModel : AppPageModelBase
    {
        public ConfirmEmailModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<ConfirmEmailModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        ) { }

        [TempData]
        public string? StatusMessage { get; set; }

        public async Task<IActionResult> OnGetAsync(string? userId, string? code)
        {
            if (userId is null || code is null)
            {
                return RedirectToPage("/Index");
            }

            var user = await UserManager.FindByIdAsync(userId);
            if (user is null)
            {
                return NotFound($"Unable to load user with ID '{userId}'.");
            }

            code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
            var result = await UserManager.ConfirmEmailAsync(user, code);
            StatusMessage = result.Succeeded ? "Thank you for confirming your email." : "Error confirming your email.";
            return Page();
        }
    }
}