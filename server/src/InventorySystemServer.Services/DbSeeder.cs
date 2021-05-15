namespace InventorySystemServer.Services
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    using Dawn;

    using InventorySystemServer.Data;
    using InventorySystemServer.Data.Models;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;

    public sealed class DbSeeder
    {
        private static readonly WebApiLogLevel[] WebApiLogLevels =
        {
            new() { Name = nameof(LogLevel.Trace), Ordinal = 0 },
            new() { Name = nameof(LogLevel.Debug), Ordinal = 1 },
            new() { Name = nameof(LogLevel.Information), Ordinal = 2 },
            new() { Name = nameof(LogLevel.Warning), Ordinal = 3 },
            new() { Name = nameof(LogLevel.Error), Ordinal = 4 },
            new() { Name = nameof(LogLevel.Critical), Ordinal = 5 }
        };

        private readonly DbSeederSettings _settings;
        private readonly AppDbContext _dbContext;
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly ILogger<DbSeeder> _logger;

        public DbSeeder
        (
            DbSeederSettings settings,
            AppDbContext dbContext,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<DbSeeder> logger
        )
        {
            Guard.Argument(settings, nameof(settings)).NotNull();
            Guard.Argument(settings.DefaultAdmins, $"{nameof(settings)}.{nameof(DbSeederSettings.DefaultAdmins)}").NotNull();
            Guard.Argument(dbContext, nameof(dbContext)).NotNull();
            Guard.Argument(userManager, nameof(userManager)).NotNull();
            Guard.Argument(roleManager, nameof(roleManager)).NotNull();
            Guard.Argument(logger, nameof(logger)).NotNull();

            _settings = settings;
            _dbContext = dbContext;
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task SeedAsync(CancellationToken cancellationToken = default)
        {
            await EnsureAppRoles(cancellationToken).ConfigureAwait(false);
            await EnsureAdmins(cancellationToken).ConfigureAwait(false);
            await EnsureWebApiLogLevels(cancellationToken).ConfigureAwait(false);
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

        private async Task EnsureWebApiLogLevels(CancellationToken cancellationToken)
        {
            foreach (var logLevel in WebApiLogLevels)
            {
                if (await _dbContext.WebApiLogLevels.AnyAsync(existingLogLevel => existingLogLevel.Name == logLevel.Name, cancellationToken).ConfigureAwait(false))
                {
                    continue;
                }

                _logger.LogDebug("Creating web API log level {name}", logLevel.Name);
                _dbContext.WebApiLogLevels.Add(logLevel);
            }

            await _dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}