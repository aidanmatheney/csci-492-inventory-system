namespace InventorySystemServer.WebApi.Dto
{
    using System.Collections.Generic;

    public sealed class OtherAppUserDto
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Name { get; set; } = null!;
        public bool EmailConfirmed { get; set; }
        public bool HasPassword { get; set; }
        public bool LockedOut { get; set; }
        public IReadOnlyList<string> AppRoles { get; set; } = null!;
    }
}