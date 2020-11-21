namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.Extensions.Logging;

    [AllowAnonymous]
    public sealed class LockoutModel : AppPageModelBase
    {
        public LockoutModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<LockoutModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        ) { }

        public void OnGet() { }
    }
}