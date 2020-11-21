namespace InventorySystemServer.Services
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    using InventorySystemServer.Utils;

    using Microsoft.Extensions.Logging;

    public sealed class ToLogEmailSender : IEmailSender
    {
        private readonly ILogger _logger;

        public ToLogEmailSender(ILogger<ToLogEmailSender> logger)
        {
            Guard.NotNull(logger, nameof(logger));
            _logger = logger;
        }

        public Task SendEmailAsync(string toAddress, string subject, string body, CancellationToken cancellationToken = default)
        {
            _logger.LogWarning($"Sending email to {{toAddress}}:{Environment.NewLine}{{subject}}:{Environment.NewLine}{{body}}", toAddress, subject, body);
            return Task.CompletedTask;
        }
    }
}