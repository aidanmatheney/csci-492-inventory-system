namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Mvc;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    public sealed class SignOutModel : AppPageModelBase
    {
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ApiClientsSettings _apiClientsSettings;

        public SignOutModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            SignInManager<AppUser> signInManager,
            ApiClientsSettings apiClientsSettings,
            ILogger<SignOutModel> logger
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

        public ActionResult OnGet(string? returnUrl = null)
        {
            if (returnUrl is not null)
            {
                return LocalRedirect(returnUrl);
            }
            return Redirect(_apiClientsSettings.WebAppBaseUrl);
        }

        public async Task<ActionResult> OnPost(string? returnUrl = null)
        {
            await _signInManager.SignOutAsync().ConfigureAwait(false);

            if (returnUrl is not null)
            {
                return LocalRedirect(returnUrl);
            }
            return Redirect(_apiClientsSettings.WebAppBaseUrl);
        }
    }
}