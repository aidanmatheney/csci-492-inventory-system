namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Linq;
    using System.Text;
    using System.Text.Encodings.Web;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Services;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.Authentication;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.WebUtilities;
    using Microsoft.Extensions.Logging;

    [AllowAnonymous]
    public sealed class RegisterModel : AppPageModelBase
    {
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IEmailSender _emailSender;
        private readonly ApiClientsSettings _apiClientsSettings;

        public RegisterModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            SignInManager<AppUser> signInManager,
            IEmailSender emailSender,
            ApiClientsSettings apiClientsSettings,
            ILogger<RegisterModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(signInManager, nameof(signInManager));
            Guard.NotNull(emailSender, nameof(emailSender));
            Guard.NotNull(apiClientsSettings, nameof(apiClientsSettings));

            _signInManager = signInManager;
            _emailSender = emailSender;
            _apiClientsSettings = apiClientsSettings;
        }

        [BindProperty]
        public InputModel? Input { get; set; }

        public string? ReturnUrl { get; set; }

        public sealed class InputModel
        {
            [Required]
            [EmailAddress]
            [Display(Name = "Email")]
            public string? Email { get; set; }

            [Required]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Password")]
            public string? Password { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Confirm password")]
            [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
            public string? ConfirmPassword { get; set; }
        }

        public void OnGet(string? returnUrl = null)
        {
            ReturnUrl = returnUrl;
        }

        public async Task<IActionResult> OnPostAsync(string? returnUrl = null)
        {
            if (ModelState.IsValid)
            {
                var user = new AppUser
                {
                    UserName = Input!.Email,
                    Email = Input.Email
                };
                var result = await UserManager.CreateAsync(user, Input.Password);
                if (result.Succeeded)
                {
                    Logger.LogInformation("User created a new account with password.");

                    var code = await UserManager.GenerateEmailConfirmationTokenAsync(user);
                    code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                    var callbackUrl = Url.Page
                    (
                        "/Account/ConfirmEmail",
                        pageHandler: null,
                        values: new
                        {
                            area = "Identity",
                            userId = user.Id,
                            code,
                            returnUrl
                        },
                        protocol: Request.Scheme
                    );

                    await _emailSender.SendEmailAsync
                    (
                        Input!.Email!,
                        "Confirm your email",
                        $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>."
                    );

                    if (UserManager.Options.SignIn.RequireConfirmedAccount)
                    {
                        return RedirectToPage("RegisterConfirmation", new
                        {
                            email = Input.Email,
                            returnUrl = returnUrl
                        });
                    }

                    await _signInManager.SignInAsync(user, isPersistent: false);

                    if (returnUrl is not null)
                    {
                        return LocalRedirect(returnUrl);
                    }
                    return Redirect(_apiClientsSettings.WebAppBaseUrl);
                }

                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }

            // If we got this far, something failed, redisplay form
            return Page();
        }
    }
}