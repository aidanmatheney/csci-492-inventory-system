namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [AllowAnonymous]
    public sealed class LogoutModel : AppPageModelBase
    {
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ApiClientsSettings _apiClientsSettings;

        public LogoutModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            SignInManager<AppUser> signInManager,
            ApiClientsSettings apiClientsSettings,
            ILogger<LogoutModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(signInManager, nameof(signInManager));
            Guard.NotNull(apiClientsSettings, nameof(apiClientsSettings));

            _signInManager = signInManager;
            _apiClientsSettings = apiClientsSettings;
        }

        public void OnGet() { }

        public async Task<IActionResult> OnPost(string? returnUrl = null)
        {
            await _signInManager.SignOutAsync();
            Logger.LogInformation("User logged out.");

            if (returnUrl is not null)
            {
                return LocalRedirect(returnUrl);
            }
            return Redirect(_apiClientsSettings.WebAppBaseUrl);
        }
    }
}