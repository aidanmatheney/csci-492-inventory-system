namespace InventorySystemServer.Data.Configurations
{
    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class WebApiLogEntryConfiguration : IEntityTypeConfiguration<WebApiLogEntry>
    {
        public void Configure(EntityTypeBuilder<WebApiLogEntry> entity)
        {
            entity.HasOne<WebApiLogLevel>().WithMany()
                .HasForeignKey(logEntry => logEntry.LogLevel)
                .HasPrincipalKey(logLevel => logLevel.Name)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}