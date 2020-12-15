namespace InventorySystemServer.Data.Models
{
    public sealed class AppUserSettings
    {
        public string UserId { get; set; } = null!;
        public AppTheme Theme { get; set; }
    }
}