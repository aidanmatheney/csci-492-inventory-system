namespace InventorySystemServer.Data.Configurations
{
    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class InventoryItemChangeConfiguration : IEntityTypeConfiguration<InventoryItemChange>
    {
        public void Configure(EntityTypeBuilder<InventoryItemChange> entity)
        {
            entity.HasKey(inventoryItemChange => new
            {
                inventoryItemChange.ItemId,
                inventoryItemChange.Sequence
            });
            entity.HasOne<InventoryItem>().WithMany()
                .HasForeignKey(inventoryItemChange => inventoryItemChange.ItemId)
                .HasPrincipalKey(inventoryItem => inventoryItem.Id)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<InventoryItemSnapshot>().WithMany()
                .HasForeignKey(inventoryItemChange => new
                {
                    inventoryItemChange.ItemId,
                    inventoryItemChange.NewSnapshotSequence
                })
                .HasPrincipalKey(inventoryItemSnapshot => new
                {
                    inventoryItemSnapshot.ItemId,
                    inventoryItemSnapshot.Sequence
                })
                .OnDelete(DeleteBehavior.Restrict);


            entity.HasOne<AppUser>().WithMany()
                .HasForeignKey(inventoryItemChange => inventoryItemChange.UserId)
                .HasPrincipalKey(appUser => appUser.Id)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}