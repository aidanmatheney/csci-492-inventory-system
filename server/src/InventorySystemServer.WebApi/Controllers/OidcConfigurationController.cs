namespace InventorySystemServer.WebApi.Controllers
{
    using System.Collections.Generic;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;

    using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    public sealed class OidcConfigurationController : HomeControllerBase
    {
        private readonly IClientRequestParametersProvider _clientRequestParametersProvider;

        public OidcConfigurationController
        (
            IClientRequestParametersProvider clientRequestParametersProvider,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ILogger<OidcConfigurationController> logger
        ) : base
        (
            userManager,
            roleManager,
            logger
        )
        {
            Guard.NotNull(clientRequestParametersProvider, nameof(clientRequestParametersProvider));
            _clientRequestParametersProvider = clientRequestParametersProvider;
        }

        [HttpGet("_configuration/{clientId}")]
        public IDictionary<string, string> GetClientRequestParameters([FromRoute] string clientId)
        {
            var parameters = (
                _clientRequestParametersProvider.GetClientParameters(HttpContext, clientId)
            );
            return parameters;
        }
    }
}
