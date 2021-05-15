namespace InventorySystemServer.Data.Models
{
    using System;
    using System.Threading.Tasks;

    using Dawn;

    using Microsoft.AspNetCore.Identity;

    public static class UserManagerExtensions
    {
        public static async Task<IdentityResult?> LockOutAsync(this UserManager<AppUser> userManager, AppUser appUser, bool lockOut)
        {
            Guard.Argument(userManager, nameof(userManager)).NotNull();
            Guard.Argument(appUser, nameof(appUser)).NotNull();

            if (appUser.LockedOut == lockOut)
            {
                return null;
            }

            var lockoutEndDate = lockOut ? DateTimeOffset.MaxValue : default(DateTimeOffset?);

            var lockOutResult = await userManager.SetLockoutEndDateAsync(appUser, lockoutEndDate).ConfigureAwait(false);
            if (!lockOutResult.Succeeded)
            {
                return lockOutResult;
            }

            var updateSecurityStampResult = await userManager.UpdateSecurityStampAsync(appUser).ConfigureAwait(false);
            if (!updateSecurityStampResult.Succeeded)
            {
                return updateSecurityStampResult;
            }

            return await userManager.UpdateAsync(appUser).ConfigureAwait(false);
        }

        public static async Task<IdentityResult?> AssignRoleAsync(this UserManager<AppUser> userManager, AppUser appUser, string appRoleName, bool assign)
        {
            Guard.Argument(userManager, nameof(userManager)).NotNull();
            Guard.Argument(appUser, nameof(appUser)).NotNull();
            Guard.Argument(appRoleName, nameof(appRoleName)).NotNull();

            var isInRole = await userManager.IsInRoleAsync(appUser, appRoleName).ConfigureAwait(false);
            if (isInRole == assign)
            {
                return null;
            }

            if (assign)
            {
                return await userManager.AddToRoleAsync(appUser, appRoleName).ConfigureAwait(false);
            }
            return await userManager.RemoveFromRoleAsync(appUser, appRoleName).ConfigureAwait(false);
        }
    }
}