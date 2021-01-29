namespace InventorySystemServer.Data.Models
{
    public sealed class InventoryItem
    {
        public int Id { get; set; }
        public string Barcode { get; set; } = null!;
    }
}