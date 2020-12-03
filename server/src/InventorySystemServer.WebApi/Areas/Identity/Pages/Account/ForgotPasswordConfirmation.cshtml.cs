namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    public sealed class ForgotPasswordConfirmation : AppPageModelBase
    {
        private readonly ApiClientsSettings _apiClientsSettings;

        public ForgotPasswordConfirmation
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ApiClientsSettings apiClientsSettings,
            ILogger<ForgotPasswordConfirmation> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(apiClientsSettings, nameof(apiClientsSettings));
            _apiClientsSettings = apiClientsSettings;
        }

        public ActionResult OnGet()
        {
            if (AppUserIsAuthenticated)
            {
                return Redirect(_apiClientsSettings.WebAppBaseUrl);
            }

            return Page();
        }
    }
}