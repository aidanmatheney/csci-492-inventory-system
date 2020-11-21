namespace InventorySystemServer.Data.Services
{
    using InventorySystemServer.Utils;

    using Microsoft.Extensions.Logging;

    public abstract class DbServiceBase
    {
        protected DbServiceBase(AppDbContext dbContext, ILogger logger)
        {
            Guard.NotNull(dbContext, nameof(dbContext));
            Guard.NotNull(logger, nameof(logger));

            DbContext = dbContext;
            Logger = logger;
        }

        protected AppDbContext DbContext { get; }
        protected ILogger Logger { get; }
    }
}