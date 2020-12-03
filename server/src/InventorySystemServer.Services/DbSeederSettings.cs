namespace InventorySystemServer.Services
{
    using System.Collections.Generic;

    public sealed class DbSeederSettings
    {
        public sealed class DefaultAppUserCredentials
        {
            public string Email { get; set; } = null!;
            public string InitialPassword { get; set; } = null!;
        }

        public IReadOnlyList<DefaultAppUserCredentials> DefaultAdmins { get; set; } = null!;
    }
}