namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.ComponentModel.DataAnnotations;
    using System.Text;
    using System.Text.Encodings.Web;
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
    public sealed class ResendEmailConfirmationModel : AppPageModelBase
    {
        private readonly IEmailSender _emailSender;

        public ResendEmailConfirmationModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            IEmailSender emailSender,
            ILogger<ResendEmailConfirmationModel> logger
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

        [BindProperty]
        public InputModel? Input { get; set; }

        public sealed class InputModel
        {
            [Required]
            [EmailAddress]
            public string? Email { get; set; }
        }

        public void OnGet() { }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var user = await UserManager.FindByEmailAsync(Input!.Email);
            if (user is null)
            {
                ModelState.AddModelError(string.Empty, "Verification email sent. Please check your email.");
                return Page();
            }

            var userId = await UserManager.GetUserIdAsync(user);
            var code = await UserManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            var callbackUrl = Url.Page
            (
                "/Account/ConfirmEmail",
                pageHandler: null,
                values: new { userId, code },
                protocol: Request.Scheme
            );
            await _emailSender.SendEmailAsync
            (
                Input!.Email!,
                "Confirm your email",
                $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>."
            );

            ModelState.AddModelError(string.Empty, "Verification email sent. Please check your email.");
            return Page();
        }
    }
}