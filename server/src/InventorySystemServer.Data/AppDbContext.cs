namespace InventorySystemServer.Data
{
    using System.Threading.Tasks;

    using IdentityServer4.EntityFramework.Entities;
    using IdentityServer4.EntityFramework.Extensions;
    using IdentityServer4.EntityFramework.Interfaces;
    using IdentityServer4.EntityFramework.Options;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;

    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Options;

    public sealed class AppDbContext : IdentityDbContext<AppUser, AppRole, string>, IPersistedGrantDbContext
    {
        private readonly IOptions<OperationalStoreOptions> _operationalStoreOptions;

        public AppDbContext(DbContextOptions dbContextOptions, IOptions<OperationalStoreOptions> operationalStoreOptions) : base(dbContextOptions)
        {
            Guard.NotNull(operationalStoreOptions, nameof(operationalStoreOptions));
            _operationalStoreOptions = operationalStoreOptions;
        }

        public DbSet<PersistedGrant> PersistedGrants { get; set; } = null!;
        public DbSet<DeviceFlowCodes> DeviceFlowCodes { get; set; } = null!;

        public DbSet<WebApiLogEntry> WebApiLogEntries { get; set; } = null!;

        Task<int> IPersistedGrantDbContext.SaveChangesAsync() => SaveChangesAsync();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.ConfigurePersistedGrantContext(_operationalStoreOptions.Value);
        }
    }
}