namespace InventorySystemServer.Utils
{
    using System;
    using System.Threading.Tasks;

    public sealed class AsyncActionDisposable : IAsyncDisposable
    {
        private readonly Func<Task> _action;

        private bool _disposed = false;
        private readonly object _disposedSync = new object();

        public AsyncActionDisposable(Func<Task> action)
        {
            Guard.NotNull(action, nameof(action));
            _action = action;
        }

        public static AsyncActionDisposable NoOp() => new AsyncActionDisposable(() => Task.CompletedTask);

        public async ValueTask DisposeAsync()
        {
            if (_disposed)
                return;

            lock (_disposedSync)
            {
                if (_disposed)
                    return;

                _disposed = true;
            }

            await _action().ConfigureAwait(false);
        }
    }
}