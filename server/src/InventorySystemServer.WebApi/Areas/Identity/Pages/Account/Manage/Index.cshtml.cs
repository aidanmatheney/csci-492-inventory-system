namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account.Manage
{
    using System.ComponentModel.DataAnnotations;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.Extensions.Logging;

    [Authorize]
    public sealed class IndexModel : AppPageModelBase
    {
        public IndexModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<IndexModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        ) { }

        public string? Email { get; set; }
        public string? Name { get; set; }

        [Display(Name = "Has password?")]
        public bool HasPassword { get; set; }

        public async Task OnGetAsync()
        {
            var appUser = await GetAuthenticatedAppUserAsync().ConfigureAwait(false);

            Email = appUser.Email;
            Name = appUser.Email; // TODO
            HasPassword = appUser.HasPassword;
        }
    }
}