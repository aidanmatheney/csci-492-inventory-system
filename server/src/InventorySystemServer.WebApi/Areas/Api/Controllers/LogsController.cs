namespace InventorySystemServer.WebApi.Areas.Api.Controllers
{
    using System.Threading;
    using System.Threading.Tasks;

    using Dawn;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Data.Services;
    using InventorySystemServer.Data.Services.DynamicQuery;
    using InventorySystemServer.WebApi.Authorization;
    using InventorySystemServer.WebApi.Dto;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [RequireAdministratorRole]
    public sealed class LogsController : ApiAreaControllerBase
    {
        private readonly ILogService _logService;

        public LogsController
        (
            ILogService logService,
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
            Guard.Argument(logService, nameof(logService)).NotNull();
            _logService = logService;
        }

        [HttpPost("WebApi/Query")]
        public async Task<DynamicQueryResult<WebApiLogEntry>> QueryWebApiLogEntries(DynamicQueryParametersDto parametersDto, CancellationToken cancellationToken)
        {
            return await _logService.QueryWebApiEntriesAsync(parametersDto.ToParameters(), cancellationToken).ConfigureAwait(false);
        }

        [HttpGet("WebApi/{entryId}")]
        public async Task<ActionResult<WebApiLogEntry>> GetWebApiLogEntry(int entryId, CancellationToken cancellationToken)
        {
            var entry = await _logService.FindWebApiEntryByIdAsync(entryId, cancellationToken).ConfigureAwait(false);
            return entry is null ? NotFound() : Ok(entry);
        }
    }
}