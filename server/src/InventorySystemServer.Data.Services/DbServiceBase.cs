namespace InventorySystemServer.Data.Services
{
    using Dawn;

    using Microsoft.Extensions.Logging;

    public abstract class DbServiceBase
    {
        protected DbServiceBase(AppDbContext dbContext, ILogger logger)
        {
            Guard.Argument(dbContext, nameof(dbContext)).NotNull();
            Guard.Argument(logger, nameof(logger)).NotNull();

            DbContext = dbContext;
            Logger = logger;
        }

        protected AppDbContext DbContext { get; }
        protected ILogger Logger { get; }
    }
}