namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Data.Services.DynamicQuery;

    public interface ILogService
    {
        Task<IReadOnlyList<WebApiLogEntry>> GetAllWebApiEntriesAsync(CancellationToken cancellationToken = default);
        Task<DynamicQueryResult<WebApiLogEntry>> QueryWebApiEntriesAsync(DynamicQueryParameters parameters, CancellationToken cancellationToken = default);
        Task<WebApiLogEntry?> FindWebApiEntryByIdAsync(int id, CancellationToken cancellationToken = default);
        Task InsertWebApiEntriesAsync(IEnumerable<WebApiLogEntry> entries, CancellationToken cancellationToken = default);
        Task DeleteWebApiEntryAsync(WebApiLogEntry entry, CancellationToken cancellationToken = default);
    }
}