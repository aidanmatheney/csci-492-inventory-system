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
    public sealed class ForgotPasswordModel : AppPageModelBase
    {
        private readonly IEmailSender _emailSender;

        public ForgotPasswordModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            IEmailSender emailSender,
            ILogger<ForgotPasswordModel> logger
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

        public async Task<IActionResult> OnPostAsync()
        {
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByEmailAsync(Input!.Email);
                if (user is null || !(await UserManager.IsEmailConfirmedAsync(user)))
                {
                    // Don't reveal that the user does not exist or is not confirmed
                    return RedirectToPage("./ForgotPasswordConfirmation");
                }

                // For more information on how to enable account confirmation and password reset please 
                // visit https://go.microsoft.com/fwlink/?LinkID=532713
                var code = await UserManager.GeneratePasswordResetTokenAsync(user);
                code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                var callbackUrl = Url.Page
                (
                    "/Account/ResetPassword",
                    pageHandler: null,
                    values: new { area = "Identity", code },
                    protocol: Request.Scheme
                );

                await _emailSender.SendEmailAsync
                (
                    Input!.Email!,
                    "Reset Password",
                    $"Please reset your password by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>."
                );

                return RedirectToPage("./ForgotPasswordConfirmation");
            }

            return Page();
        }
    }
}