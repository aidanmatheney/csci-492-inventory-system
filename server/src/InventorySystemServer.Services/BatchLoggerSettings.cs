namespace InventorySystemServer.Services
{
    using System;

    using Microsoft.Extensions.Logging;

    public sealed class BatchLoggerSettings
    {
        public LogLevel LogLevel { get; set; }
        public TimeSpan FlushInterval { get; set; }
    }
}