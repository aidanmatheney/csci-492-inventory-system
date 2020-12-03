namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.ComponentModel.DataAnnotations;
    using System.Text;
    using System.Text.Encodings.Web;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Services;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.WebUtilities;
    using Microsoft.Extensions.Logging;

    public sealed class ForgotPasswordModel : AppPageModelBase
    {
        private readonly IEmailSender _emailSender;
        private readonly ApiClientsSettings _apiClientsSettings;

        public ForgotPasswordModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            IEmailSender emailSender,
            ApiClientsSettings apiClientsSettings,
            ILogger<ForgotPasswordModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(emailSender, nameof(emailSender));
            Guard.NotNull(apiClientsSettings, nameof(apiClientsSettings));

            _emailSender = emailSender;
            _apiClientsSettings = apiClientsSettings;
        }

        [BindProperty]
        public InputModel Input { get; set; } = new();

        public sealed class InputModel
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; } = "";
        }

        public ActionResult OnGet()
        {
            if (AppUserIsAuthenticated)
            {
                return Redirect(_apiClientsSettings.WebAppBaseUrl);
            }

            return Page();
        }

        public async Task<ActionResult> OnPostAsync(CancellationToken cancellationToken)
        {
            if (AppUserIsAuthenticated)
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
                return RedirectToPage("./ForgotPasswordConfirmation");
            }

            if (!appUser.EmailConfirmed)
            {
                Logger.LogDebug("App user {appUserEmail} attempted to sign in without a confirmed email", appUser.Email);
                ModelState.AddModelError("", "Unconfirmed email address. Check your email for an invitation link.");
                return Page();
            }

            var resetPasswordToken = await UserManager.GeneratePasswordResetTokenAsync(appUser).ConfigureAwait(false);
            var resetPasswordCode = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(resetPasswordToken));
            var resetPasswordUrl = Url.Page
            (
                "/Account/ResetPassword",
                pageHandler: null,
                values: new
                {
                    area = "Identity",
                    code = resetPasswordCode
                },
                protocol: Request.Scheme
            );

            await _emailSender.SendEmailAsync
            (
                appUser.Email,
                "Reset Password - Inventory System",
                $"Please reset your password by <a href='{HtmlEncoder.Default.Encode(resetPasswordUrl)}'>clicking here</a>.",
                cancellationToken
            ).ConfigureAwait(false);

            Logger.LogDebug("Sent password reset email to {appUserEmail}", appUser.Email);

            return RedirectToPage("./ForgotPasswordConfirmation");
        }
    }
}