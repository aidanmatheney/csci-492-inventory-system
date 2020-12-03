namespace InventorySystemServer.WebApi.Dto
{
    using System.Collections.Generic;

    public sealed class CurrentAppUserDto
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Name { get; set; } = null!;
        public IReadOnlyList<string> AppRoles { get; set; } = null!;
    }
}