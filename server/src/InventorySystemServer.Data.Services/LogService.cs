namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    using Dawn;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Data.Services.DynamicQuery;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;

    public sealed class LogService : DbServiceBase, ILogService
    {
        private readonly DynamicQueryExecutor<WebApiLogEntry> DynamicWebApiEntryQueryExecutor;

        public LogService(AppDbContext dbContext, ILogger<LogService> logger) : base(dbContext, logger)
        {
            DynamicWebApiEntryQueryExecutor = new DynamicQueryExecutor<WebApiLogEntry>.Builder()
                .SortValue
                (
                    logEntry => logEntry.LogLevel,
                    DbContext.WebApiLogLevels,
                    logLevel => logLevel.Name,
                    logLevel => logLevel.Ordinal
                )
                .Build();
        }

        public async Task<IReadOnlyList<WebApiLogEntry>> GetAllWebApiEntriesAsync(CancellationToken cancellationToken = default)
        {
            return await DbContext.WebApiLogEntries
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<DynamicQueryResult<WebApiLogEntry>> QueryWebApiEntriesAsync(DynamicQueryParameters parameters, CancellationToken cancellationToken = default)
        {
            Guard.Argument(parameters, nameof(parameters)).NotNull();
            return await DynamicWebApiEntryQueryExecutor.QueryAsync(DbContext.WebApiLogEntries, parameters, cancellationToken).ConfigureAwait(false);
        }

        public async Task<WebApiLogEntry?> FindWebApiEntryByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await DbContext.WebApiLogEntries
                .Where(e => e.Id == id)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task InsertWebApiEntriesAsync(IEnumerable<WebApiLogEntry> entries, CancellationToken cancellationToken = default)
        {
            Guard.Argument(entries, nameof(entries)).NotNull();

            // ReSharper disable once MethodHasAsyncOverloadWithCancellation
            DbContext.WebApiLogEntries.AddRange(entries);
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task DeleteWebApiEntryAsync(WebApiLogEntry entry, CancellationToken cancellationToken = default)
        {
            Guard.Argument(entry, nameof(entry)).NotNull();

            DbContext.WebApiLogEntries.Remove(entry);
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}