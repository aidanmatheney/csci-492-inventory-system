namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;

    public interface IAppUserService
    {
        Task<AppUser?> FindAppUserByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<AppRole>> FindAppUserRolesByIdAsync(string id, CancellationToken cancellationToken = default);
    }
}