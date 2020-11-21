namespace InventorySystemServer.Services
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Services;
    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;

    using Microsoft.Extensions.DependencyInjection;

    public sealed class DbLoggerProvider : BatchLoggerProviderBase
    {
        public DbLoggerProvider
        (
            BatchLoggerSettings settings,
            IServiceProvider serviceProvider
        ) : base
        (
            settings?.FlushInterval ?? throw new ArgumentNullException(nameof(settings)),
            settings?.LogLevel ?? throw new ArgumentNullException(nameof(settings)),
            serviceProvider
        ) { }

        protected override async Task ExecuteAsync(IEnumerable<WebApiLogEntry> entries, IServiceProvider scopedServiceProvider)
        {
            Guard.NotNull(entries, nameof(entries));
            Guard.NotNull(scopedServiceProvider, nameof(scopedServiceProvider));

            var logService = scopedServiceProvider.GetRequiredService<ILogService>();
            await logService.InsertWebApiEntriesAsync(entries).ConfigureAwait(false);
        }
    }
}
