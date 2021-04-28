namespace InventorySystemServer.WebApi
{
    using System;
    using System.IO;
    using System.Reflection;

    using IdentityServer4.Services;

    using InventorySystemServer.Data;
    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Data.Services;
    using InventorySystemServer.Services;
    using InventorySystemServer.Utils;
    using InventorySystemServer.WebApi.Authorization;
    using InventorySystemServer.WebApi.Settings;

    using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
    using Microsoft.AspNetCore.Authentication;
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc.Abstractions;
    using Microsoft.AspNetCore.Mvc.Controllers;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Net.Http.Headers;
    using Microsoft.OpenApi.Models;

    public sealed class Startup
    {
        private const string ConnectionStringEnvironmentVariableName = "INVENTORY_SYSTEM_CONNECTION_STRING";

        private const string WebAppCorsPolicyName = "WebAppCorsPolicy";

        public Startup(IConfiguration configuration)
        {
            Guard.NotNull(configuration, nameof(configuration));
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var connectionString = Environment.GetEnvironmentVariable(ConnectionStringEnvironmentVariableName);
            if (connectionString is null)
            {
                throw new InvalidOperationException($"The {ConnectionStringEnvironmentVariableName} environment variable is not set");
            }

            services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

            services.AddDatabaseDeveloperPageExceptionFilter();

            services
                .AddAuthentication(options =>
                {
                    options.DefaultScheme = IdentityConstants.ApplicationScheme;
                    options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
                })
                .AddIdentityCookies();

            services
                .AddIdentityCore<AppUser>(options =>
                {
                    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                    options.User.RequireUniqueEmail = true;

                    options.Password.RequiredLength = 8;
                    options.Password.RequiredUniqueChars = 4;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireUppercase = true;
                    options.Password.RequireDigit = true;

                    options.Lockout.AllowedForNewUsers = true;
                    options.Lockout.MaxFailedAccessAttempts = 5;
                    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);

                    options.SignIn.RequireConfirmedEmail = true;
                    options.SignIn.RequireConfirmedPhoneNumber = false;
                    options.SignIn.RequireConfirmedAccount = true;

                    options.Stores.MaxLengthForKeys = 128;
                    options.Stores.ProtectPersonalData = false;
                })
                .AddRoles<AppRole>()
                .AddSignInManager()
                .AddDefaultTokenProviders()
                .AddEntityFrameworkStores<AppDbContext>();

            var apiClientsSettings = Configuration.GetSection("ApiClients").Get<ApiClientsSettings>();
            var webAppBaseUrl = apiClientsSettings?.WebAppBaseUrl;
            if (webAppBaseUrl is null)
            {
                throw new InvalidOperationException("Authentication.WebAppBaseUrl setting is missing");
            }

            services.AddAuthorization(options =>
            {
                options.AddPolicy(AuthorizationPolicyName.RequireStudentRole, policy => policy.RequireRole(AppRoleName.Student));
                options.AddPolicy(AuthorizationPolicyName.RequireSecretaryRole, policy => policy.RequireRole(AppRoleName.Secretary));
                options.AddPolicy(AuthorizationPolicyName.RequireStudentOrSecretaryRole, policy => policy.RequireRole(AppRoleName.Student, AppRoleName.Secretary));
                options.AddPolicy(AuthorizationPolicyName.RequireAdministratorRole, policy => policy.RequireRole(AppRoleName.Administrator));
            });

            services
                .AddIdentityServer()
                .AddApiAuthorization<AppUser, AppDbContext>(options =>
                {
                    options.Clients.AddSPA("inventory-system-web", client =>
                    {
                        client.WithRedirectUri($"{webAppBaseUrl}/sign-in-callback");
                        client.WithRedirectUri($"{webAppBaseUrl}/silent-authentication-renew.html");
                        client.WithLogoutRedirectUri($"{webAppBaseUrl}/sign-out-callback");
                    });
                });

            services
                .AddAuthentication()
                .AddIdentityServerJwt();

            services.Configure<JwtBearerOptions>(IdentityServerJwtConstants.IdentityServerJwtBearerScheme, options =>
            {
                // Don't map JWT claim types (e.g. sub, role) to ASP.NET claim types (XML namespaces)
                options.MapInboundClaims = false;
            });

            services.AddScoped<IProfileService, AppClaimsProfileService>();

            services.AddControllersWithViews();
            services.AddRazorPages();

            services.ConfigureApplicationCookie(options =>
            {
                options.LoginPath = "/Identity/Account/SignIn";
                options.LogoutPath = "/Identity/Account/SignOut";
                options.AccessDeniedPath = "/Identity/Account/AccessDenied";

                options.ExpireTimeSpan = TimeSpan.FromDays(7);
                options.SlidingExpiration = true;
            });

            services.AddCors(options =>
            {
                options.AddPolicy(WebAppCorsPolicyName, policy =>
                {
                    policy.WithOrigins(webAppBaseUrl);
                    policy.WithHeaders(HeaderNames.Authorization, HeaderNames.ContentType);
                    policy.WithMethods(HttpMethods.Get, HttpMethods.Post, HttpMethods.Put, HttpMethods.Delete);
                });
            });

            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Inventory System Web API",
                    Version = "v1"
                });

                options.CustomOperationIds(api =>
                {
                    if (api.ActionDescriptor is ControllerActionDescriptor controllerAction)
                    {
                        return controllerAction.ActionName;
                    }

                    throw new InvalidOperationException($"Unknown {nameof(ActionDescriptor)} type: {api.ActionDescriptor.GetType()}");
                });

                var docFileName = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var docFilePath = Path.Combine(AppContext.BaseDirectory, docFileName);
                options.IncludeXmlComments(docFilePath);
            });

            services.AddSingleton(apiClientsSettings!);

            services.AddScoped<IAppUserService, AppUserService>();
            services.AddScoped<IAppRoleService, AppRoleService>();

            services.AddScoped<IInventoryService, InventoryService>();

            services.AddScoped<ILogService, LogService>();

            services.AddScoped<IEmailSender, ToLogEmailSender>();

            services.AddSingleton(Configuration.GetSection("DbSeeder").Get<DbSeederSettings>());
            services.AddTransient<DbSeeder>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseMigrationsEndPoint();
            }
            else
            {
                app.UseExceptionHandler("/Error");

                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            // This includes the static Identity assets provided by Microsoft.AspNetCore.Identity.UI (stylesheets and JavaScript files for Identity UI)
            // See https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity?view=aspnetcore-5.0&tabs=visual-studio#prevent-publish-of-static-identity-assets
            app.UseStaticFiles();

            app.UseRouting();

            app.UseCors(WebAppCorsPolicyName);

            app.UseAuthentication();
            app.UseIdentityServer();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapRazorPages();
            });

            app.UseSwagger(options =>
            {
                options.RouteTemplate = "/api-docs/{documentName}/swagger.json";
            });
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/api-docs/v1/swagger.json", "Inventory System Web API V1");
                options.RoutePrefix = "api-docs";
            });
        }
    }
}