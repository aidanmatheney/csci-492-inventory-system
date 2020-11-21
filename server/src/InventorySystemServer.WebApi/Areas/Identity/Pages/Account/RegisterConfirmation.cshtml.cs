namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.Text;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Services;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.WebUtilities;
    using Microsoft.Extensions.Logging;

    [AllowAnonymous]
    public sealed class RegisterConfirmationModel : AppPageModelBase
    {
        private readonly IEmailSender _emailSender;

        public RegisterConfirmationModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            IEmailSender emailSender,
            ILogger<RegisterConfirmationModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(emailSender, nameof(emailSender));
            _emailSender = emailSender;
        }

        public string? Email { get; set; }

        public bool DisplayConfirmAccountLink { get; set; }

        public string? EmailConfirmationUrl { get; set; }

        public async Task<IActionResult> OnGetAsync(string? email, string? returnUrl = null)
        {
            if (email is null)
            {
                return RedirectToPage("/Index");
            }

            var user = await UserManager.FindByEmailAsync(email);
            if (user is null)
            {
                return NotFound($"Unable to load user with email '{email}'.");
            }

            Email = email;
            // Once you add a real email sender, you should remove this code that lets you confirm the account
            DisplayConfirmAccountLink = true;
            if (DisplayConfirmAccountLink)
            {
                var userId = await UserManager.GetUserIdAsync(user);
                var code = await UserManager.GenerateEmailConfirmationTokenAsync(user);
                code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                EmailConfirmationUrl = Url.Page
                (
                    "/Account/ConfirmEmail",
                    pageHandler: null,
                    values: new
                    {
                        area = "Identity",
                        userId,
                        code,
                        returnUrl
                    },
                    protocol: Request.Scheme
                );
            }

            return Page();
        }
    }
}