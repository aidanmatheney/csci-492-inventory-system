namespace InventorySystemServer.WebApi.Authorization
{
    using Microsoft.AspNetCore.Authorization;

    public sealed class RequireAdministratorRoleAttribute : AuthorizeAttribute
    {
        public RequireAdministratorRoleAttribute() : base(AuthorizationPolicyName.RequireAdministratorRole) { }
    }
}