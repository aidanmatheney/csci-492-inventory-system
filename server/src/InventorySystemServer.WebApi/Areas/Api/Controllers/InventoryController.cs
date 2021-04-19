namespace InventorySystemServer.WebApi.Areas.Api.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Data.Services;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Authorization;
    using InventorySystemServer.WebApi.Dto;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [RequireSecretaryRole]
    public sealed class InventoryController : ApiAreaControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController
        (
            IInventoryService inventoryService,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<AppUsersController> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(inventoryService, nameof(inventoryService));
            _inventoryService = inventoryService;
        }

        [HttpGet("ItemHistories")]
        public async Task<IReadOnlyList<InventoryItemHistoryDto>> GetItemHistories(CancellationToken cancellationToken)
        {
            var items = await _inventoryService.GetAllItemsAsync(cancellationToken).ConfigureAwait(false);

            var itemHistories = await items.ToAsyncEnumerable()
                .SelectAwait(async item =>
                {
                    var changes = await _inventoryService.FindItemChangesByItemIdAsync(item.Id, cancellationToken).ConfigureAwait(false);
                    var snapshots = await _inventoryService.FindItemSnapshotsByItemIdAsync(item.Id, cancellationToken).ConfigureAwait(false);

                    return new InventoryItemHistoryDto
                    {
                        Item = item,
                        Changes = changes,
                        Snapshots = snapshots
                    };
                })
                .ToListAsync(cancellationToken).ConfigureAwait(false);

            return itemHistories;
        }

        public sealed class CreateItemRequest
        {
            public InventoryItem Item { get; set; } = null!;
            public InventoryItemSnapshot Snapshot { get; set; } = null!;
        }

        public sealed class CreateItemResponse
        {
            public int NewItemId { get; set; }
        }

        [HttpPost("Items")]
        public async Task<CreateItemResponse> CreateItem(CreateItemRequest request, CancellationToken cancellationToken)
        {
            var change = new InventoryItemChange
            {
                UserId = AuthenticatedAppUserId,
                Date = DateTimeOffset.Now
            };

            await _inventoryService.CreateItemAsync(request.Item, change, request.Snapshot, cancellationToken).ConfigureAwait(false);
            return new CreateItemResponse
            {
                NewItemId = request.Item.Id
            };
        }

        public sealed class UpdateItemRequest
        {
            public InventoryItemSnapshot Snapshot { get; set; } = null!;
        }

        [HttpPut("Items/{itemId}")]
        public async Task<ActionResult> UpdateItem(int itemId, UpdateItemRequest request, CancellationToken cancellationToken)
        {
            var item = await _inventoryService.FindItemByIdAsync(itemId, cancellationToken).ConfigureAwait(false);
            if (item is null)
            {
                return NotFound();
            }

            var change = new InventoryItemChange
            {
                UserId = AuthenticatedAppUserId,
                Date = DateTimeOffset.Now
            };

            await _inventoryService.UpdateItemAsync(item, change, request.Snapshot, cancellationToken).ConfigureAwait(false);
            return Ok();
        }

        [HttpDelete("Items/{itemId}")]
        public async Task<ActionResult> DeleteItem(int itemId, CancellationToken cancellationToken)
        {
            var item = await _inventoryService.FindItemByIdAsync(itemId, cancellationToken).ConfigureAwait(false);
            if (item is null)
            {
                return NotFound();
            }

            var change = new InventoryItemChange
            {
                UserId = AuthenticatedAppUserId,
                Date = DateTimeOffset.Now
            };

            await _inventoryService.DeleteItemAsync(item, change, cancellationToken).ConfigureAwait(false);
            return Ok();
        }

        public sealed class ApproveItemChangeRequest
        {
            public bool? Approved { get; set; }
        }

        [HttpPost("Items/{itemId}/Changes/{changeSequence}")]
        public async Task<ActionResult> ApproveItemChange(int itemId, int changeSequence, ApproveItemChangeRequest request, CancellationToken cancellationToken)
        {
            var change = await _inventoryService.FindItemChangeByIdAsync(itemId, changeSequence, cancellationToken).ConfigureAwait(false);
            if (change is null)
            {
                return NotFound();
            }

            change.Approved = request.Approved;

            await _inventoryService.UpdateItemChangeAsync(change, cancellationToken).ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("AssigneeHistories")]
        public async Task<IReadOnlyList<InventoryAssigneeHistoryDto>> GetAssigneeHistories(CancellationToken cancellationToken)
        {
            var assignees = await _inventoryService.GetAllAssigneesAsync(cancellationToken).ConfigureAwait(false);

            var assigneeHistories = await assignees.ToAsyncEnumerable()
                .SelectAwait(async assignee =>
                {
                    var changes = await _inventoryService.FindAssigneeChangesByAssigneeIdAsync(assignee.Id, cancellationToken).ConfigureAwait(false);
                    var snapshots = await _inventoryService.FindAssigneeSnapshotsByAssigneeIdAsync(assignee.Id, cancellationToken).ConfigureAwait(false);

                    return new InventoryAssigneeHistoryDto
                    {
                        Assignee = assignee,
                        Changes = changes,
                        Snapshots = snapshots
                    };
                })
                .ToListAsync(cancellationToken).ConfigureAwait(false);

            return assigneeHistories;
        }

        public sealed class CreateAssigneeRequest
        {
            public InventoryAssignee Assignee { get; set; } = null!;
            public InventoryAssigneeSnapshot Snapshot { get; set; } = null!;
        }

        public sealed class CreateAssigneeResponse
        {
            public int NewAssigneeId { get; set; }
        }

        [HttpPost("Assignees")]
        public async Task<CreateAssigneeResponse> CreateAssignee(CreateAssigneeRequest request, CancellationToken cancellationToken)
        {
            var change = new InventoryAssigneeChange
            {
                UserId = AuthenticatedAppUserId,
                Date = DateTimeOffset.Now
            };

            await _inventoryService.CreateAssigneeAsync(request.Assignee, change, request.Snapshot, cancellationToken).ConfigureAwait(false);
            return new CreateAssigneeResponse
            {
                NewAssigneeId = request.Assignee.Id
            };
        }

        public sealed class UpdateAssigneeRequest
        {
            public InventoryAssigneeSnapshot Snapshot { get; set; } = null!;
        }

        [HttpPut("Assignees/{assigneeId}")]
        public async Task<ActionResult> UpdateAssignee(int assigneeId, UpdateAssigneeRequest request, CancellationToken cancellationToken)
        {
            var assignee = await _inventoryService.FindAssigneeByIdAsync(assigneeId, cancellationToken).ConfigureAwait(false);
            if (assignee is null)
            {
                return NotFound();
            }

            var change = new InventoryAssigneeChange
            {
                UserId = AuthenticatedAppUserId,
                Date = DateTimeOffset.Now
            };

            await _inventoryService.UpdateAssigneeAsync(assignee, change, request.Snapshot, cancellationToken).ConfigureAwait(false);
            return Ok();
        }

        [HttpDelete("Assignees/{assigneeId}")]
        public async Task<ActionResult> DeleteAssignee(int assigneeId, CancellationToken cancellationToken)
        {
            var assignee = await _inventoryService.FindAssigneeByIdAsync(assigneeId, cancellationToken).ConfigureAwait(false);
            if (assignee is null)
            {
                return NotFound();
            }

            var change = new InventoryAssigneeChange
            {
                UserId = AuthenticatedAppUserId,
                Date = DateTimeOffset.Now
            };

            await _inventoryService.DeleteAssigneeAsync(assignee, change, cancellationToken).ConfigureAwait(false);
            return Ok();
        }

        public sealed class ApproveAssigneeChangeRequest
        {
            public bool? Approved { get; set; }
        }

        [HttpPost("Assignees/{assigneeId}/Changes/{changeSequence}")]
        public async Task<ActionResult> ApproveAssigneeChange(int assigneeId, int changeSequence, ApproveAssigneeChangeRequest request, CancellationToken cancellationToken)
        {
            var change = await _inventoryService.FindAssigneeChangeByIdAsync(assigneeId, changeSequence, cancellationToken).ConfigureAwait(false);
            if (change is null)
            {
                return NotFound();
            }

            await _inventoryService.UpdateAssigneeChangeAsync(change, cancellationToken).ConfigureAwait(false);
            return Ok();
        }
    }
}