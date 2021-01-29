namespace InventorySystemServer.WebApi.Dto
{
    using System.Collections.Generic;

    using InventorySystemServer.Data.Models;

    public sealed class InventoryItemHistoryDto
    {
        public InventoryItem Item { get; set; } = null!;
        public IReadOnlyList<InventoryItemChange> Changes { get; set; } = null!;
        public IReadOnlyList<InventoryItemSnapshot> Snapshots { get; set; } = null!;
    }
}