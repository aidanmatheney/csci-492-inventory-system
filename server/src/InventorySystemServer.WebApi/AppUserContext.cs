﻿namespace InventorySystemServer.WebApi
{
    using System;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;

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
            Guard.NotNull(getClaimsUser, nameof(getClaimsUser));
            Guard.NotNull(userManager, nameof(userManager));
            Guard.NotNull(roleManager, nameof(roleManager));
            Guard.NotNull(logger, nameof(logger));

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
            var nameClaim = _getClaimsUser().Claims.SingleOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier);
            return nameClaim?.Value;
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