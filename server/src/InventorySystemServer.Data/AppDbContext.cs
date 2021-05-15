namespace InventorySystemServer.Data
{
    using System.Threading.Tasks;

    using Dawn;

    using IdentityServer4.EntityFramework.Entities;
    using IdentityServer4.EntityFramework.Extensions;
    using IdentityServer4.EntityFramework.Interfaces;
    using IdentityServer4.EntityFramework.Options;

    using InventorySystemServer.Data.Models;

    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Options;

    public sealed class AppDbContext : IdentityDbContext<AppUser, AppRole, string>, IPersistedGrantDbContext
    {
        private readonly IOptions<OperationalStoreOptions> _operationalStoreOptions;

        public AppDbContext(DbContextOptions dbContextOptions, IOptions<OperationalStoreOptions> operationalStoreOptions) : base(dbContextOptions)
        {
            Guard.Argument(operationalStoreOptions, nameof(operationalStoreOptions)).NotNull();
            _operationalStoreOptions = operationalStoreOptions;
        }

        public DbSet<PersistedGrant> PersistedGrants { get; set; } = null!;
        public DbSet<DeviceFlowCodes> DeviceFlowCodes { get; set; } = null!;

        public DbSet<AppUserSettings> AppUserSettings { get; set; } = null!;

        public DbSet<InventoryItem> InventoryItems { get; set; } = null!;
        public DbSet<InventoryItemChange> InventoryItemChanges { get; set; } = null!;
        public DbSet<InventoryItemSnapshot> InventoryItemSnapshots { get; set; } = null!;
        public DbSet<InventoryAssignee> InventoryAssignees { get; set; } = null!;
        public DbSet<InventoryAssigneeChange> InventoryAssigneeChanges { get; set; } = null!;
        public DbSet<InventoryAssigneeSnapshot> InventoryAssigneeSnapshots { get; set; } = null!;

        public DbSet<WebApiLogEntry> WebApiLogEntries { get; set; } = null!;
        public DbSet<WebApiLogLevel> WebApiLogLevels { get; set; } = null!;

        Task<int> IPersistedGrantDbContext.SaveChangesAsync() => SaveChangesAsync();

        protected override void OnModelCreating(ModelBuilder model)
        {
            base.OnModelCreating(model);
            model.ConfigurePersistedGrantContext(_operationalStoreOptions.Value);
            model.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}