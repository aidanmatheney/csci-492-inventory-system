namespace InventorySystemServer.WebApi.Authorization
{
    using InventorySystemServer.Data.Models;

    public static class AuthorizationPolicyName
    {
        public const string RequireSecretaryRole = "Require" + AppRoleName.Secretary + "Role";
        public const string RequireAdministratorRole = "Require" + AppRoleName.Administrator + "Role";
    }
}