namespace InventorySystemServer.WebApi.Dto
{
    using System.Collections.Generic;

    using InventorySystemServer.Data.Models;

    public sealed class InventoryAssigneeHistoryDto
    {
        public InventoryAssignee Assignee { get; set; } = null!;
        public IReadOnlyList<InventoryAssigneeChange> Changes { get; set; } = null!;
        public IReadOnlyList<InventoryAssigneeSnapshot> Snapshots { get; set; } = null!;
    }
}