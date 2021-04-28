namespace InventorySystemServer.WebApi.Authorization
{
    using Microsoft.AspNetCore.Authorization;

    public sealed class RequireStudentRoleAttribute : AuthorizeAttribute
    {
        public RequireStudentRoleAttribute() : base(AuthorizationPolicyName.RequireStudentRole) { }
    }
}