namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;

    public sealed class LogService : DbServiceBase, ILogService
    {
        public LogService(AppDbContext dbContext, ILogger<LogService> logger) : base(dbContext, logger) { }

        public async Task<IEnumerable<WebApiLogEntry>> GetAllWebApiEntriesAsync(CancellationToken cancellationToken = default)
        {
            return await DbContext.WebApiLogEntries
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<WebApiLogEntry?> FindWebApiEntryByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await DbContext.WebApiLogEntries
                .Where(e => e.Id == id)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task InsertWebApiEntriesAsync(IEnumerable<WebApiLogEntry> entries, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(entries, nameof(entries));

            // ReSharper disable once MethodHasAsyncOverloadWithCancellation
            DbContext.WebApiLogEntries.AddRange(entries);
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task DeleteWebApiEntryAsync(WebApiLogEntry entry, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(entry, nameof(entry));

            DbContext.WebApiLogEntries.Remove(entry);
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}