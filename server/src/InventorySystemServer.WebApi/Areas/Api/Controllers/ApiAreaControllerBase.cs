namespace InventorySystemServer.WebApi.Areas.Api.Controllers
{
    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [ApiController]
    [Area("Api")]
    [Route("/[area]/[controller]")]
    public abstract class ApiAreaControllerBase : AppControllerBase
    {
        protected ApiAreaControllerBase
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