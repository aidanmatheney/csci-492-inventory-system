namespace InventorySystemServer.Services
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.Extensions.Logging;

    public sealed class DbSeeder
    {
        private readonly DbSeederSettings _settings;
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly ILogger<DbSeeder> _logger;

        public DbSeeder
        (
            DbSeederSettings settings,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<DbSeeder> logger
        )
        {
            Guard.NotNull(settings, nameof(settings));
            Guard.NotNull(settings.DefaultAdmins, $"{nameof(settings)}.{nameof(DbSeederSettings.DefaultAdmins)}");
            Guard.NotNull(userManager, nameof(userManager));
            Guard.NotNull(roleManager, nameof(roleManager));
            Guard.NotNull(logger, nameof(logger));

            _settings = settings;
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task SeedAsync(CancellationToken cancellationToken = default)
        {
            await EnsureAppRoles(cancellationToken).ConfigureAwait(false);
            await EnsureAdmins(cancellationToken).ConfigureAwait(false);
        }

        private async Task EnsureAppRoles(CancellationToken cancellationToken)
        {
            await EnsureAppRole(AppRoleName.Student, cancellationToken).ConfigureAwait(false);
            await EnsureAppRole(AppRoleName.Secretary, cancellationToken).ConfigureAwait(false);
            await EnsureAppRole(AppRoleName.Administrator, cancellationToken).ConfigureAwait(false);
        }

        private async Task<AppRole> EnsureAppRole(string appRoleName, CancellationToken cancellationToken)
        {
            var existingAppRole = await _roleManager.FindByNameAsync(appRoleName).ConfigureAwait(false);
            if (existingAppRole is not null)
            {
                _logger.LogDebug("App role {appRoleName} already exists", appRoleName);
                return existingAppRole;
            }

            _logger.LogDebug("Creating app role {appRoleName}", appRoleName);
            var newAppRole = new AppRole
            {
                Name = appRoleName
            };
            var createRoleResult = await _roleManager.CreateAsync(newAppRole).ConfigureAwait(false);
            if (!createRoleResult.Succeeded)
            {
                _logger.LogCritical("Failed to create app role {appRoleName}. Result: {result}", appRoleName, createRoleResult);
                throw new Exception($"Failed to create app role {appRoleName}. Result: {createRoleResult}");
            }
            return newAppRole;
        }

        private async Task EnsureAdmins(CancellationToken cancellationToken)
        {
            foreach (var defaultAdmin in _settings.DefaultAdmins)
            {
                var admin = await EnsureAppUser(defaultAdmin.Email, defaultAdmin.InitialPassword, cancellationToken).ConfigureAwait(false);
                await EnsureLockedOut(admin, false, cancellationToken).ConfigureAwait(false);

                await EnsureAppUserRole(admin, AppRoleName.Student, cancellationToken).ConfigureAwait(false);
                await EnsureAppUserRole(admin, AppRoleName.Secretary, cancellationToken).ConfigureAwait(false);
                await EnsureAppUserRole(admin, AppRoleName.Administrator, cancellationToken).ConfigureAwait(false);
            }
        }

        private async Task<AppUser> EnsureAppUser(string email, string initialPassword, CancellationToken cancellationToken)
        {
            var existingAppUser = await _userManager.FindByEmailAsync(email).ConfigureAwait(false);
            if (existingAppUser is not null)
            {
                _logger.LogDebug("App user {email} already exists", email);
                return existingAppUser;
            }

            _logger.LogDebug("Creating app user {email}", email);
            var newAppUser = new AppUser
            {
                Email = email,
                UserName = email,
                EmailConfirmed = true
            };
            var createAppUserResult = await _userManager.CreateAsync(newAppUser, initialPassword).ConfigureAwait(false);
            if (!createAppUserResult.Succeeded)
            {
                _logger.LogCritical("Failed to create app user {email}. Result: {result}", email, createAppUserResult);
                throw new Exception($"Failed to create app user {email}. Result: {createAppUserResult}");
            }
            return newAppUser;
        }

        private async Task EnsureLockedOut(AppUser appUser, bool lockedOut, CancellationToken cancellationToken)
        {
            _logger.LogDebug($"Ensuring app user {{email}} is {(lockedOut ? string.Empty : "not ")}locked out", appUser.Email);
            await _userManager.LockOutAsync(appUser, lockedOut).ConfigureAwait(false);
        }

        private async Task EnsureAppUserRole(AppUser appUser, string appRoleName, CancellationToken cancellationToken)
        {
            var hasAppRole = await _userManager.IsInRoleAsync(appUser, appRoleName).ConfigureAwait(false);
            if (hasAppRole)
            {
                _logger.LogDebug("App user {email} already has {appRoleName} app role", appUser.Email, appRoleName);
                return;
            }

            _logger.LogDebug("Adding app user {email} to {appRoleName} app role", appUser.Email, appRoleName);
            var addToAppRoleResult = await _userManager.AddToRoleAsync(appUser, appRoleName).ConfigureAwait(false);
            if (!addToAppRoleResult.Succeeded)
            {
                _logger.LogCritical("Failed to add app user {email} to {appRoleName} app role. Result: {result}", appUser.Email, appRoleName, addToAppRoleResult);
                throw new Exception($"Failed to add app user {appUser.Email} to {appRoleName} app role. Result: {addToAppRoleResult}");
            }
        }
    }
}
