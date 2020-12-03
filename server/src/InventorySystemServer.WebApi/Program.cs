namespace InventorySystemServer.WebApi
{
    using System;
    using System.Threading.Tasks;

    using InventorySystemServer.Services;

    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;

    // ReSharper disable once ConvertToStaticClass
    internal sealed class Program
    {
        private Program() { }

        private static async Task Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            using (var serviceScope = host.Services.CreateScope())
            {
                var services = serviceScope.ServiceProvider;

                var logger = services.GetRequiredService<ILogger<Program>>();

                logger.LogWarning("InventorySystemServer.WebApi starting on {machineName}", Environment.MachineName);

                var dbSeeder = services.GetRequiredService<DbSeeder>();
                try
                {
                    await dbSeeder.SeedAsync().ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    logger.LogCritical(ex, "Failed to seed the database");
                    throw;
                }
            }

            await host.RunAsync().ConfigureAwait(false);
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            var hostBuilder = Host.CreateDefaultBuilder(args);

            hostBuilder.ConfigureWebHostDefaults(webHostBuilder =>
            {
                webHostBuilder.UseStartup<Startup>();
            });

            hostBuilder.ConfigureLogging(loggingBuilder =>
            {
                var services = loggingBuilder.Services;
                services.AddSingleton<ILoggerProvider>(serviceProvider =>
                {
                    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
                    var settings = configuration.GetSection("Logging:Database").Get<BatchLoggerSettings>();

                    return new DbLoggerProvider(settings, serviceProvider);
                });
            });

            return hostBuilder;
        }
    }
}