namespace InventorySystemServer.Data.Configurations
{
    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class InventoryAssigneeConfiguration : IEntityTypeConfiguration<InventoryAssignee>
    {
        public void Configure(EntityTypeBuilder<InventoryAssignee> entity)
        {
            entity.HasKey(inventoryAssignee => inventoryAssignee.Id);
            entity.Property(inventoryAssignee => inventoryAssignee.Id).ValueGeneratedOnAdd();
        }
    }
}