﻿namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    using Dawn;

    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;

    public sealed class AppRoleService : DbServiceBase, IAppRoleService
    {
        public AppRoleService(AppDbContext dbContext, ILogger<AppRoleService> logger) : base(dbContext, logger) { }

        public async Task<IReadOnlyList<AppRole>> GetAllAppRolesAsync(CancellationToken cancellationToken = default)
        {
            return await DbContext.Roles
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<AppRole?> FindAppRoleByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            Guard.Argument(id, nameof(id)).NotNull();

            return await DbContext.Roles
                .Where(appRole => appRole.Id == id)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<AppRole?> FindAppRoleByNameAsync(string name, CancellationToken cancellationToken = default)
        {
            Guard.Argument(name, nameof(name)).NotNull();

            return await DbContext.Roles
                .Where(appRole => appRole.Name == name)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}