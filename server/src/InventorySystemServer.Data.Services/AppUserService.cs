namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    using Dawn;

    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;

    public sealed class AppUserService : DbServiceBase, IAppUserService
    {
        public AppUserService(AppDbContext dbContext, ILogger<AppUserService> logger) : base(dbContext, logger) { }

        public async Task<IReadOnlyList<AppUser>> GetAllAppUsersAsync(CancellationToken cancellationToken = default)
        {
            return await DbContext.Users
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<AppUser?> FindAppUserByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            Guard.Argument(id, nameof(id)).NotNull();

            return await DbContext.Users
                .Where(appUser => appUser.Id == id)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task DeleteAppUserAsync(AppUser appUser, CancellationToken cancellationToken = default)
        {
            Guard.Argument(appUser, nameof(appUser)).NotNull();

            DbContext.Users.Remove(appUser);
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<IReadOnlyList<AppRole>> GetAppUserRolesAsync(AppUser appUser, CancellationToken cancellationToken = default)
        {
            Guard.Argument(appUser, nameof(appUser)).NotNull();

            return await DbContext.UserRoles
                .Where(appUserRole => appUserRole.UserId == appUser.Id)
                .Join
                (
                    DbContext.Roles,
                    appUserRole => appUserRole.RoleId,
                    appRole => appRole.Id,
                    (appUserRole, appRole) => appRole
                )
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<AppUserSettings?> GetAppUserSettingsAsync(AppUser appUser, CancellationToken cancellationToken = default)
        {
            Guard.Argument(appUser, nameof(appUser)).NotNull();

            return await DbContext.AppUserSettings
                .Where(s => s.UserId == appUser.Id)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task SaveAppUserSettingsAsync(AppUserSettings settings, CancellationToken cancellationToken = default)
        {
            Guard.Argument(settings, nameof(settings)).NotNull();

            if (await DbContext.AppUserSettings.AnyAsync(s => s.UserId == settings.UserId, cancellationToken).ConfigureAwait(false))
            {
                DbContext.AppUserSettings.Update(settings);
            }
            else
            {
                // ReSharper disable once MethodHasAsyncOverloadWithCancellation
                DbContext.AppUserSettings.Add(settings);
            }

            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}