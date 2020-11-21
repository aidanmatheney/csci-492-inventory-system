namespace InventorySystemServer.Data.Models
{
    using System;

    public sealed class WebApiLogEntry
    {
        public int Id { get; set; }

        public DateTimeOffset TimeWritten { get; set; }
        public string ServerName { get; set; } = null!;

        public string Category { get; set; } = null!;
        public string? Scope { get; set; }
        public string LogLevel { get; set; } = null!;
        public int EventId { get; set; }
        public string? EventName { get; set; }
        public string Message { get; set; } = null!;
        public string? Exception { get; set; }
    }
}
