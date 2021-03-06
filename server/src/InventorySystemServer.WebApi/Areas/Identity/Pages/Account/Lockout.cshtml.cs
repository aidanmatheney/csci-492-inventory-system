﻿namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using Dawn;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    public sealed class LockoutModel : AppPageModelBase
    {
        private readonly ApiClientsSettings _apiClientsSettings;

        public LockoutModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ApiClientsSettings apiClientsSettings,
            ILogger<LockoutModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.Argument(apiClientsSettings, nameof(apiClientsSettings)).NotNull();
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