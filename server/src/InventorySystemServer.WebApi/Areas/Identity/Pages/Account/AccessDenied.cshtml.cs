namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.Extensions.Logging;

    public sealed class AccessDeniedModel : AppPageModelBase
    {
        public AccessDeniedModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<AccessDeniedModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        ) { }

        public void OnGet() { }
    }
}