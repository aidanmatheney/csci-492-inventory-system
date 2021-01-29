namespace InventorySystemServer.Data.Configurations
{
    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class InventoryItemConfiguration : IEntityTypeConfiguration<InventoryItem>
    {
        public void Configure(EntityTypeBuilder<InventoryItem> entity)
        {
            entity.HasKey(inventoryItem => inventoryItem.Id);
            entity.Property(inventoryItem => inventoryItem.Id).ValueGeneratedOnAdd();

            entity.HasIndex(inventoryItem => inventoryItem.Barcode).IsUnique();
        }
    }
}