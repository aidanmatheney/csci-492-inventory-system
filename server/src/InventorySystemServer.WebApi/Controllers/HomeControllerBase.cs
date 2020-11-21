namespace InventorySystemServer.WebApi.Controllers
{
    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [ApiController]
    public abstract class HomeControllerBase : AppControllerBase
    {
        protected HomeControllerBase
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        ) { }
    }
}
