namespace InventorySystemServer.Data.Models
{
    public sealed class InventoryAssigneeSnapshot
    {
        public int AssigneeId { get; set; }
        public int Sequence { get; set; }

        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
    }
}