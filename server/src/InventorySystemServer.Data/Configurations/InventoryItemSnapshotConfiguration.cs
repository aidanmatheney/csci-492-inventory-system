namespace InventorySystemServer.Data.Configurations
{
    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class InventoryItemSnapshotConfiguration : IEntityTypeConfiguration<InventoryItemSnapshot>
    {
        public void Configure(EntityTypeBuilder<InventoryItemSnapshot> entity)
        {
            entity.HasKey(inventoryItemSnapshot => new
            {
                inventoryItemSnapshot.ItemId,
                inventoryItemSnapshot.Sequence
            });
            entity.HasOne<InventoryItem>().WithMany()
                .HasForeignKey(inventoryItemSnapshot => inventoryItemSnapshot.ItemId)
                .HasPrincipalKey(inventoryItem => inventoryItem.Id)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<InventoryAssignee>().WithMany()
                .HasForeignKey(inventoryItemSnapshot => inventoryItemSnapshot.AssigneeId)
                .HasPrincipalKey(inventoryAssignee => inventoryAssignee.Id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}