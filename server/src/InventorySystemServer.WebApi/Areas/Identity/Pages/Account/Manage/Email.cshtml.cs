namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account.Manage
{
    using System.ComponentModel.DataAnnotations;
    using System.Text;
    using System.Text.Encodings.Web;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Services;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.WebUtilities;
    using Microsoft.Extensions.Logging;

    public sealed class EmailModel : AppPageModelBase
    {
        private readonly IEmailSender _emailSender;

        public EmailModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            IEmailSender emailSender,
            ILogger<EmailModel> logger
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

        public string? Username { get; set; }

        public string? Email { get; set; }

        public bool IsEmailConfirmed { get; set; }

        [TempData]
        public string? StatusMessage { get; set; }

        [BindProperty]
        public InputModel? Input { get; set; }

        public sealed class InputModel
        {
            [Required]
            [EmailAddress]
            [Display(Name = "New email")]
            public string? NewEmail { get; set; }
        }

        private async Task LoadAsync(AppUser user)
        {
            var email = await UserManager.GetEmailAsync(user);
            Email = email;

            Input = new InputModel
            {
                NewEmail = email,
            };

            IsEmailConfirmed = await UserManager.IsEmailConfirmedAsync(user);
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var user = await UserManager.GetUserAsync(User);
            if (user is null)
            {
                return NotFound($"Unable to load user with ID '{UserManager.GetUserId(User)}'.");
            }

            await LoadAsync(user);
            return Page();
        }

        public async Task<IActionResult> OnPostChangeEmailAsync()
        {
            var user = await UserManager.GetUserAsync(User);
            if (user is null)
            {
                return NotFound($"Unable to load user with ID '{UserManager.GetUserId(User)}'.");
            }

            if (!ModelState.IsValid)
            {
                await LoadAsync(user);
                return Page();
            }

            var email = await UserManager.GetEmailAsync(user);
            if (Input!.NewEmail != email)
            {
                var userId = await UserManager.GetUserIdAsync(user);
                var code = await UserManager.GenerateChangeEmailTokenAsync(user, Input.NewEmail);
                code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                var callbackUrl = Url.Page
                (
                    "/Account/ConfirmEmailChange",
                    pageHandler: null,
                    values: new
                    {
                        userId,
                        email = Input.NewEmail,
                        code
                    },
                    protocol: Request.Scheme
                );
                await _emailSender.SendEmailAsync
                (
                    Input!.NewEmail!,
                    "Confirm your email",
                    $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>."
                );

                StatusMessage = "Confirmation link to change email sent. Please check your email.";
                return RedirectToPage();
            }

            StatusMessage = "Your email is unchanged.";
            return RedirectToPage();
        }

        public async Task<IActionResult> OnPostSendVerificationEmailAsync()
        {
            var user = await UserManager.GetUserAsync(User);
            if (user is null)
            {
                return NotFound($"Unable to load user with ID '{UserManager.GetUserId(User)}'.");
            }

            if (!ModelState.IsValid)
            {
                await LoadAsync(user);
                return Page();
            }

            var userId = await UserManager.GetUserIdAsync(user);
            var email = await UserManager.GetEmailAsync(user);
            var code = await UserManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            var callbackUrl = Url.Page
            (
                "/Account/ConfirmEmail",
                pageHandler: null,
                values: new
                {
                    area = "Identity",
                    userId,
                    code
                },
                protocol: Request.Scheme
            );
            await _emailSender.SendEmailAsync
            (
                email,
                "Confirm your email",
                $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>."
            );

            StatusMessage = "Verification email sent. Please check your email.";
            return RedirectToPage();
        }
    }
}