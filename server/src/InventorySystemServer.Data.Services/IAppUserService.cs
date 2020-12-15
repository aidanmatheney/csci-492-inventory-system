namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;

    public interface IAppUserService
    {
        Task<IReadOnlyList<AppUser>> GetAllAppUsersAsync(CancellationToken cancellationToken = default);
        Task<AppUser?> FindAppUserByIdAsync(string id, CancellationToken cancellationToken = default);
        Task DeleteAppUserAsync(AppUser appUser, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AppRole>> GetAppUserRolesAsync(AppUser appUser, CancellationToken cancellationToken = default);

        Task<AppUserSettings?> GetAppUserSettingsAsync(AppUser appUser, CancellationToken cancellationToken = default);
        Task SaveAppUserSettingsAsync(AppUserSettings settings, CancellationToken cancellationToken = default);
    }
}