namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;

    public interface IAppRoleService
    {
        Task<IReadOnlyList<AppRole>> GetAllAppRolesAsync(CancellationToken cancellationToken = default);
        Task<AppRole?> FindAppRoleByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<AppRole?> FindAppRoleByNameAsync(string name, CancellationToken cancellationToken = default);
    }
}