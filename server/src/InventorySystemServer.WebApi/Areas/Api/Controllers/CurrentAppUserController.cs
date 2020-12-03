namespace InventorySystemServer.WebApi.Areas.Api.Controllers
{
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Data.Services;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Dto;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [Authorize]
    public sealed class CurrentAppUserController : ApiAreaControllerBase
    {
        private readonly IAppUserService _appUserService;

        public CurrentAppUserController
        (
            IAppUserService appUserService,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<CurrentAppUserController> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(appUserService, nameof(appUserService));
            _appUserService = appUserService;
        }

        [HttpGet]
        public async Task<CurrentAppUserDto> Get(CancellationToken cancellationToken)
        {
            var appUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);
            var appRoles = await _appUserService.GetAppUserRolesAsync(appUser, cancellationToken).ConfigureAwait(false);

            return new CurrentAppUserDto
            {
                Id = appUser.Id,
                Email = appUser.Email,
                Name = appUser.Email,
                AppRoles = appRoles.Select(appRole => appRole.Name).ToList()
            };
        }
    }
}