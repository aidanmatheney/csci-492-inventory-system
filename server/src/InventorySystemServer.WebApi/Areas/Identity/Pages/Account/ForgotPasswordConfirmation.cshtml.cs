namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account
{
    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.Extensions.Logging;

    [AllowAnonymous]
    public sealed class ForgotPasswordConfirmation : AppPageModelBase
    {
        public ForgotPasswordConfirmation
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<ForgotPasswordConfirmation> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        ) { }

        public void OnGet() { }
    }
}