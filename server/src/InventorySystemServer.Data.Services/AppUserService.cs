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

        public async Task<AppUser?> FindAppUserByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(id, nameof(id));

            return await DbContext.Users
                .Where(appUser => appUser.Id == id)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<IReadOnlyList<AppRole>> FindAppUserRolesByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(id, nameof(id));

            return await DbContext.UserRoles
                .Where(appUserRole => appUserRole.UserId == id)
                .Join
                (
                    DbContext.Roles,
                    appUserRole => appUserRole.RoleId,
                    appRole => appRole.Id,
                    (appUserRole, appRole) => appRole
                )
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}