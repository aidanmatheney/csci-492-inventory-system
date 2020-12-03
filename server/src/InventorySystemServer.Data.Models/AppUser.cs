namespace InventorySystemServer.Data.Models
{
    using System;

    using InventorySystemServer.Utils;

    using Microsoft.AspNetCore.Identity;

    public sealed class AppUser : IdentityUser
    {
        public bool HasPassword => PasswordHash is not null;

        public bool LockedOut => LockoutEnd?.ApproximatelyEquals(DateTimeOffset.MaxValue) ?? false;
    }
}