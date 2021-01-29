namespace InventorySystemServer.Data.Configurations
{
    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class InventoryAssigneeSnapshotConfiguration : IEntityTypeConfiguration<InventoryAssigneeSnapshot>
    {
        public void Configure(EntityTypeBuilder<InventoryAssigneeSnapshot> entity)
        {
            entity.HasKey(inventoryAssigneeSnapshot => new
            {
                inventoryAssigneeSnapshot.AssigneeId,
                inventoryAssigneeSnapshot.Sequence
            });
            entity.HasOne<InventoryAssignee>().WithMany()
                .HasForeignKey(inventoryAssigneeSnapshot => inventoryAssigneeSnapshot.AssigneeId)
                .HasPrincipalKey(inventoryAssignee => inventoryAssignee.Id)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}