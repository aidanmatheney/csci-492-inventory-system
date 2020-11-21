namespace InventorySystemServer.Services
{
    using System.Threading;
    using System.Threading.Tasks;

    public interface IEmailSender
    {
        Task SendEmailAsync(string toAddress, string subject, string body, CancellationToken cancellationToken = default);
    }
}