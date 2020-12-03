namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;

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
            Guard.NotNull(id, nameof(id));

            return await DbContext.Users
                .Where(appUser => appUser.Id == id)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<IReadOnlyList<AppRole>> GetAppUserRolesAsync(AppUser appUser, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(appUser, nameof(appUser));

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

        public async Task DeleteAppUserAsync(AppUser appUser, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(appUser, nameof(appUser));

            DbContext.Users.Remove(appUser);
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}