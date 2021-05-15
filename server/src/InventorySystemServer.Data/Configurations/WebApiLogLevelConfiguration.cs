namespace InventorySystemServer.Data.Configurations
{
    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class WebApiLogLevelConfiguration : IEntityTypeConfiguration<WebApiLogLevel>
    {
        public void Configure(EntityTypeBuilder<WebApiLogLevel> entity)
        {
            entity.HasKey(logLevel => logLevel.Name);
            entity.HasIndex(logLevel => logLevel.Ordinal).IsUnique();
        }
    }
}