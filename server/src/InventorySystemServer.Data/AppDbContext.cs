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
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
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

        public DbSet<AppUserSettings> AppUserSettings { get; set; } = null!;

        public DbSet<WebApiLogEntry> WebApiLogEntries { get; set; } = null!;

        Task<int> IPersistedGrantDbContext.SaveChangesAsync() => SaveChangesAsync();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.ConfigurePersistedGrantContext(_operationalStoreOptions.Value);

            builder.Entity<AppUserSettings>(ConfigureAppUserSettings);
        }

        private static void ConfigureAppUserSettings(EntityTypeBuilder<AppUserSettings> table)
        {
            table.HasKey(s => s.UserId);
            table.HasOne<AppUser>().WithMany()
                .HasForeignKey(s => s.UserId)
                .HasPrincipalKey(u => u.Id)
                .OnDelete(DeleteBehavior.Cascade);

            table.Property(s => s.Theme).HasConversion<string?>();
        }
    }
}