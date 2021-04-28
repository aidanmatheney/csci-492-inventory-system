namespace InventorySystemServer.WebApi.Authorization
{
    using Microsoft.AspNetCore.Authorization;

    public sealed class RequireStudentOrSecretaryRoleAttribute : AuthorizeAttribute
    {
        public RequireStudentOrSecretaryRoleAttribute() : base(AuthorizationPolicyName.RequireStudentOrSecretaryRole) { }
    }
}