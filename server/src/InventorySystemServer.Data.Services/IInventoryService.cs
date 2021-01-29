namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;

    public interface IInventoryService
    {
        Task<IReadOnlyList<InventoryItem>> GetAllItemsAsync(CancellationToken cancellationToken = default);
        Task<InventoryItem?> FindItemByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<InventoryItem?> FindItemByBarcodeAsync(string barcode, CancellationToken cancellationToken = default);
        Task<InventoryItemChange?> FindItemChangeByIdAsync(int itemId, int sequence, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<InventoryItemChange>> FindItemChangesByItemIdAsync(int itemId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<InventoryItemSnapshot>> FindItemSnapshotsByItemIdAsync(int itemId, CancellationToken cancellationToken = default);
        Task CreateItemAsync(InventoryItem item, InventoryItemChange change, InventoryItemSnapshot snapshot, CancellationToken cancellationToken = default);
        Task UpdateItemAsync(InventoryItem item, InventoryItemChange change, InventoryItemSnapshot snapshot, CancellationToken cancellationToken = default);
        Task DeleteItemAsync(InventoryItem item, InventoryItemChange change, CancellationToken cancellationToken = default);
        Task UpdateItemChangeAsync(InventoryItemChange change, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<InventoryAssignee>> GetAllAssigneesAsync(CancellationToken cancellationToken = default);
        Task<InventoryAssignee?> FindAssigneeByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<InventoryAssigneeChange?> FindAssigneeChangeByIdAsync(int assigneeId, int sequence, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<InventoryAssigneeChange>> FindAssigneeChangesByAssigneeIdAsync(int assigneeId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<InventoryAssigneeSnapshot>> FindAssigneeSnapshotsByAssigneeIdAsync(int assigneeId, CancellationToken cancellationToken = default);
        Task CreateAssigneeAsync(InventoryAssignee assignee, InventoryAssigneeChange change, InventoryAssigneeSnapshot snapshot, CancellationToken cancellationToken = default);
        Task UpdateAssigneeAsync(InventoryAssignee assignee, InventoryAssigneeChange change, InventoryAssigneeSnapshot snapshot, CancellationToken cancellationToken = default);
        Task DeleteAssigneeAsync(InventoryAssignee assignee, InventoryAssigneeChange change, CancellationToken cancellationToken = default);
        Task UpdateAssigneeChangeAsync(InventoryAssigneeChange change, CancellationToken cancellationToken = default);
    }
}