namespace InventorySystemServer.Services
{
    using System.Threading.Tasks;

    using IdentityModel;

    using IdentityServer4.Models;
    using IdentityServer4.Services;

    public sealed class AppClaimsProfileService : IProfileService
    {
        public Task GetProfileDataAsync(ProfileDataRequestContext context)
        {
            // The only user-specific claim issued by default is sub (subject/user ID)
            context.IssuedClaims.AddRange(context.Subject.FindAll(JwtClaimTypes.Role));
            return Task.CompletedTask;
        }

        public Task IsActiveAsync(IsActiveContext context) => Task.CompletedTask;
    }
}