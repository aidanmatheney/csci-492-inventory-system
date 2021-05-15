namespace InventorySystemServer.WebApi
{
    using System;
    using System.Security.Claims;
    using System.Threading.Tasks;

    using Dawn;

    using IdentityModel;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.Extensions.Logging;

    public sealed class AppUserContext
    {
        private readonly Func<ClaimsPrincipal> _getClaimsUser;
        private readonly Lazy<string?> _appUserId;
        private readonly AsyncLazy<AppUser?> _appUser;

        public AppUserContext
        (
            Func<ClaimsPrincipal> getClaimsUser,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger logger
        )
        {
            Guard.Argument(getClaimsUser, nameof(getClaimsUser)).NotNull();
            Guard.Argument(userManager, nameof(userManager)).NotNull();
            Guard.Argument(roleManager, nameof(roleManager)).NotNull();
            Guard.Argument(logger, nameof(logger)).NotNull();

            _getClaimsUser = getClaimsUser;
            _appUserId = new Lazy<string?>(LoadAppUserId);
            _appUser = new AsyncLazy<AppUser?>(LoadAppUserAsync);

            UserManager = userManager;
            RoleManager = roleManager;
            Logger = logger;
        }

        public UserManager<AppUser> UserManager { get; }
        public RoleManager<AppRole> RoleManager { get; }
        public ILogger Logger { get; }

        public string? AppUserId => _appUserId.Value;
        public bool AppUserIsAuthenticated => AppUserId is not null;
        public string AuthenticatedAppUserId
        {
            get
            {
                if (AppUserId is null)
                {
                    throw new InvalidOperationException("The app user is not authenticated");
                }

                return AppUserId;
            }
        }

        /// <summary>
        ///     Get the current user, or <see langword="null" /> if they are not authenticated.
        /// </summary>
        public Task<AppUser?> GetAppUserAsync() => _appUser.Value;

        /// <summary>
        ///     Get the current user when the application logic should have ensured that they are authenticated. An
        ///     example of this situation is when the Authorize attribute is placed on a controller.
        /// </summary>
        public async Task<AppUser> GetAuthenticatedAppUserAsync()
        {
            var appUser = await GetAppUserAsync().ConfigureAwait(false);
            if (appUser is null)
            {
                throw new InvalidOperationException("The app user is not authenticated");
            }

            return appUser;
        }

        private string? LoadAppUserId()
        {
            return _getClaimsUser().FindFirstValue(JwtClaimTypes.Subject);
        }

        private async Task<AppUser?> LoadAppUserAsync()
        {
            if (AppUserId is null)
                return null;

            var appUser = await UserManager.FindByIdAsync(AppUserId).ConfigureAwait(false);
            return appUser;
        }
    }
}