namespace InventorySystemServer.WebApi.Authorization
{
    using InventorySystemServer.Data.Models;

    public static class AuthorizationPolicyName
    {
        private const string Require = "Require";
        private const string Role = "Role";
        private const string Or = "Or";

        public const string RequireStudentRole = Require + AppRoleName.Student + Role;
        public const string RequireSecretaryRole = Require + AppRoleName.Secretary + Role;
        public const string RequireStudentOrSecretaryRole = Require + AppRoleName.Student + Or + AppRoleName.Secretary + Role;
        public const string RequireAdministratorRole = Require + AppRoleName.Administrator + Role;
    }
}