namespace InventorySystemServer.WebApi
{
    using InventorySystemServer.Services;

    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;

    internal static class Program
    {
        private static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
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