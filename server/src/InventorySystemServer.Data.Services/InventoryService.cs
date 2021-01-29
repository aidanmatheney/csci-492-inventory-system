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

    public sealed class InventoryService : DbServiceBase, IInventoryService
    {
        public InventoryService(AppDbContext dbContext, ILogger<InventoryService> logger) : base(dbContext, logger) { }

        public async Task<IReadOnlyList<InventoryItem>> GetAllItemsAsync(CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryItems
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<InventoryItem?> FindItemByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryItems
                .Where(item => item.Id == id)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<InventoryItem?> FindItemByBarcodeAsync(string barcode, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(barcode, nameof(barcode));

            return await DbContext.InventoryItems
                .Where(item => item.Barcode == barcode)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<InventoryItemChange?> FindItemChangeByIdAsync(int itemId, int sequence, CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryItemChanges
                .SingleOrDefaultAsync(itemChange => itemChange.ItemId == itemId && itemChange.Sequence == sequence, cancellationToken).ConfigureAwait(false);
        }

        public async Task<IReadOnlyList<InventoryItemChange>> FindItemChangesByItemIdAsync(int itemId, CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryItemChanges
                .Where(itemChange => itemChange.ItemId == itemId)
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<IReadOnlyList<InventoryItemSnapshot>> FindItemSnapshotsByItemIdAsync(int itemId, CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryItemSnapshots
                .Where(itemSnapshot => itemSnapshot.ItemId == itemId)
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task CreateItemAsync(InventoryItem item, InventoryItemChange change, InventoryItemSnapshot snapshot, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(item, nameof(item));
            Guard.NotNull(change, nameof(change));
            Guard.NotNull(snapshot, nameof(snapshot));

            await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken).ConfigureAwait(false);

            DbContext.InventoryItems.Add(item);
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            change.ItemId = item.Id;
            change.Sequence = 1;
            change.NewSnapshotSequence = 1;
            DbContext.InventoryItemChanges.Add(change);

            snapshot.ItemId = item.Id;
            snapshot.Sequence = 1;
            DbContext.InventoryItemSnapshots.Add(snapshot);

            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task UpdateItemAsync(InventoryItem item, InventoryItemChange change, InventoryItemSnapshot snapshot, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(item, nameof(item));
            Guard.NotNull(change, nameof(change));
            Guard.NotNull(snapshot, nameof(snapshot));

            var lastChange = await DbContext.InventoryItemChanges.OrderBy(someChange => someChange.Sequence).LastAsync(cancellationToken).ConfigureAwait(false);
            var lastSnapshot = await DbContext.InventoryItemSnapshots.OrderBy(someSnapshot => someSnapshot.Sequence).LastAsync(cancellationToken).ConfigureAwait(false);

            change.ItemId = item.Id;
            change.Sequence = lastChange.Sequence + 1;
            change.NewSnapshotSequence = lastSnapshot.Sequence + 1;
            DbContext.InventoryItemChanges.Add(change);

            snapshot.ItemId = item.Id;
            snapshot.Sequence = lastSnapshot.Sequence + 1;
            DbContext.InventoryItemSnapshots.Add(snapshot);

            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task DeleteItemAsync(InventoryItem item, InventoryItemChange change, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(item, nameof(item));
            Guard.NotNull(change, nameof(change));

            var lastChange = await DbContext.InventoryItemChanges.OrderBy(someChange => someChange.Sequence).LastAsync(cancellationToken).ConfigureAwait(false);

            change.ItemId = item.Id;
            change.Sequence = lastChange.Sequence + 1;
            DbContext.InventoryItemChanges.Add(change);

            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task UpdateItemChangeAsync(InventoryItemChange change, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(change, nameof(change));
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<IReadOnlyList<InventoryAssignee>> GetAllAssigneesAsync(CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryAssignees
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<InventoryAssignee?> FindAssigneeByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryAssignees
                .Where(item => item.Id == id)
                .SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<InventoryAssigneeChange?> FindAssigneeChangeByIdAsync(int assigneeId, int sequence, CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryAssigneeChanges
                .SingleOrDefaultAsync(assigneeChange => assigneeChange.AssigneeId == assigneeId && assigneeChange.Sequence == sequence, cancellationToken).ConfigureAwait(false);
        }

        public async Task<IReadOnlyList<InventoryAssigneeChange>> FindAssigneeChangesByAssigneeIdAsync(int assigneeId, CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryAssigneeChanges
                .Where(assigneeChange => assigneeChange.AssigneeId == assigneeId)
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<IReadOnlyList<InventoryAssigneeSnapshot>> FindAssigneeSnapshotsByAssigneeIdAsync(int assigneeId, CancellationToken cancellationToken = default)
        {
            return await DbContext.InventoryAssigneeSnapshots
                .Where(assigneeSnapshot => assigneeSnapshot.AssigneeId == assigneeId)
                .ToListAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task CreateAssigneeAsync(InventoryAssignee assignee, InventoryAssigneeChange change, InventoryAssigneeSnapshot snapshot, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(assignee, nameof(assignee));
            Guard.NotNull(change, nameof(change));
            Guard.NotNull(snapshot, nameof(snapshot));

            await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken).ConfigureAwait(false);

            DbContext.InventoryAssignees.Add(assignee);
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            change.AssigneeId = assignee.Id;
            change.Sequence = 1;
            change.NewSnapshotSequence = 1;
            DbContext.InventoryAssigneeChanges.Add(change);

            snapshot.AssigneeId = assignee.Id;
            snapshot.Sequence = 1;
            DbContext.InventoryAssigneeSnapshots.Add(snapshot);

            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task UpdateAssigneeAsync(InventoryAssignee assignee, InventoryAssigneeChange change, InventoryAssigneeSnapshot snapshot, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(assignee, nameof(assignee));
            Guard.NotNull(change, nameof(change));
            Guard.NotNull(snapshot, nameof(snapshot));

            var lastChange = await DbContext.InventoryAssigneeChanges.OrderBy(someChange => someChange.Sequence).LastAsync(cancellationToken).ConfigureAwait(false);
            var lastSnapshot = await DbContext.InventoryAssigneeSnapshots.OrderBy(someSnapshot => someSnapshot.Sequence).LastAsync(cancellationToken).ConfigureAwait(false);

            change.AssigneeId = assignee.Id;
            change.Sequence = lastChange.Sequence + 1;
            change.NewSnapshotSequence = lastSnapshot.Sequence + 1;
            DbContext.InventoryAssigneeChanges.Add(change);

            snapshot.AssigneeId = assignee.Id;
            snapshot.Sequence = lastSnapshot.Sequence + 1;
            DbContext.InventoryAssigneeSnapshots.Add(snapshot);

            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task DeleteAssigneeAsync(InventoryAssignee assignee, InventoryAssigneeChange change, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(assignee, nameof(assignee));
            Guard.NotNull(change, nameof(change));

            var lastChange = await DbContext.InventoryAssigneeChanges.OrderBy(someChange => someChange.Sequence).LastAsync(cancellationToken).ConfigureAwait(false);

            change.AssigneeId = assignee.Id;
            change.Sequence = lastChange.Sequence + 1;
            DbContext.InventoryAssigneeChanges.Add(change);

            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task UpdateAssigneeChangeAsync(InventoryAssigneeChange change, CancellationToken cancellationToken = default)
        {
            Guard.NotNull(change, nameof(change));
            await DbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}