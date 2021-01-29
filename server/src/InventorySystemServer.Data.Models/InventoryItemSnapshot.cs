namespace InventorySystemServer.Data.Models
{
    using System;

    public sealed class InventoryItemSnapshot
    {
        public int ItemId { get; set; }
        public int Sequence { get; set; }

        public string Name { get; set; } = null!;
        public string? Category { get; set; }
        public decimal? Cost { get; set; }
        public string? Building { get; set; }
        public string? Floor { get; set; }
        public string? Room { get; set; }
        public DateTimeOffset? AcquiredDate { get; set; }
        public DateTimeOffset? SurplussedDate { get; set; }
        public int? AssigneeId { get; set; }
        public string? FlaggedReason { get; set; }
    }
}