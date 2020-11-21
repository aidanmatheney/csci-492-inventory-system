namespace InventorySystemServer.WebApi.Mvc
{
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.Extensions.Logging;

    public abstract class AppPageModelBase : PageModel
    {
        protected AppPageModelBase
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger logger
        )
        {
            Guard.NotNull(logger, nameof(logger));

            UserManager = userManager;
            RoleManager = roleManager;
            Logger = logger;

            AppUserContext = new AppUserContext
            (
                () => User,
                userManager,
                roleManager,
                logger
            );
        }

        protected UserManager<AppUser> UserManager { get; }
        protected RoleManager<AppRole> RoleManager { get; }
        protected ILogger Logger { get; }

        protected AppUserContext AppUserContext { get; }
        protected string? AppUserId => AppUserContext.AppUserId;
        protected bool AppUserIsAuthenticated => AppUserContext.AppUserIsAuthenticated;
        protected string AuthenticatedAppUserId => AppUserContext.AuthenticatedAppUserId;
        protected Task<AppUser?> GetAppUserAsync() => AppUserContext.GetAppUserAsync();
        protected Task<AppUser> GetAuthenticatedAppUserAsync() => AppUserContext.GetAuthenticatedAppUserAsync();
    }
}