namespace InventorySystemServer.Data.Configurations
{
    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class InventoryAssigneeChangeConfiguration : IEntityTypeConfiguration<InventoryAssigneeChange>
    {
        public void Configure(EntityTypeBuilder<InventoryAssigneeChange> entity)
        {
            entity.HasKey(inventoryAssigneeChange => new
            {
                inventoryAssigneeChange.AssigneeId,
                inventoryAssigneeChange.Sequence
            });
            entity.HasOne<InventoryAssignee>().WithMany()
                .HasForeignKey(inventoryAssigneeChange => inventoryAssigneeChange.AssigneeId)
                .HasPrincipalKey(inventoryAssignee => inventoryAssignee.Id)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<InventoryAssigneeSnapshot>().WithMany()
                .HasForeignKey(inventoryAssigneeChange => new
                {
                    inventoryAssigneeChange.AssigneeId,
                    inventoryAssigneeChange.NewSnapshotSequence
                })
                .HasPrincipalKey(inventoryAssigneeSnapshot => new
                {
                    inventoryAssigneeSnapshot.AssigneeId,
                    inventoryAssigneeSnapshot.Sequence
                })
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<AppUser>().WithMany()
                .HasForeignKey(inventoryAssigneeChange => inventoryAssigneeChange.UserId)
                .HasPrincipalKey(appUser => appUser.Id)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}