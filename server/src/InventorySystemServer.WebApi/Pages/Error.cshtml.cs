namespace InventorySystemServer.WebApi.Pages
{
    using System.Diagnostics;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.WebApi.Mvc;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public sealed class ErrorModel : AppPageModelBase
    {
        public ErrorModel
        (
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<ErrorModel> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        ) { }

        public string? RequestId { get; set; }
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);

        public void OnGet() => RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
    }
}