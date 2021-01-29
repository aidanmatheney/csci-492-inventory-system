namespace InventorySystemServer.Data.Models
{
    using System;

    public sealed class InventoryAssigneeChange
    {
        public int AssigneeId { get; set; }
        public int Sequence { get; set; }
        public int? NewSnapshotSequence { get; set; }

        public string? UserId { get; set; } = null!;
        public DateTimeOffset Date { get; set; }

        public bool? Approved { get; set; }
    }
}