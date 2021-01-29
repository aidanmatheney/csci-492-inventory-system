namespace InventorySystemServer.WebApi.Areas.Api.Controllers
{
    using System;
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

        [HttpGet("Settings")]
        public async Task<CurrentAppUserSettingsDto> GetSettings(CancellationToken cancellationToken)
        {
            var appUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);
            var existingSettings = await _appUserService.GetAppUserSettingsAsync(appUser, cancellationToken).ConfigureAwait(false);

            AppUserSettings settings;
            if (existingSettings is null)
            {
                settings = new AppUserSettings
                {
                    UserId = appUser.Id,
                    Theme = null
                };
                await _appUserService.SaveAppUserSettingsAsync(settings, cancellationToken).ConfigureAwait(false);
            }
            else
            {
                settings = existingSettings;
            }

            return new CurrentAppUserSettingsDto
            {
                Theme = settings.Theme?.ToString()
            };
        }

        [HttpPut("Settings")]
        public async Task SaveSettings(CurrentAppUserSettingsDto settingsDto, CancellationToken cancellationToken)
        {
            var appUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);

            var settings = new AppUserSettings
            {
                UserId = appUser.Id,
                Theme = settingsDto.Theme is null ? null : Enum.Parse<AppTheme>(settingsDto.Theme)
            };
            await _appUserService.SaveAppUserSettingsAsync(settings, cancellationToken).ConfigureAwait(false);
        }
    }
}