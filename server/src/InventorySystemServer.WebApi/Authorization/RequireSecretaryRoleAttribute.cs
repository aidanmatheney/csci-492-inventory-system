namespace InventorySystemServer.WebApi.Authorization
{
    using Microsoft.AspNetCore.Authorization;

    public sealed class RequireSecretaryRoleAttribute : AuthorizeAttribute
    {
        public RequireSecretaryRoleAttribute() : base(AuthorizationPolicyName.RequireSecretaryRole) {  }
    }
}