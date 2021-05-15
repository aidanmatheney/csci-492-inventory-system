namespace InventorySystemServer.Utils
{
    using System;
    using System.Threading.Tasks;

    using Dawn;

    public sealed class AsyncActionDisposable : IAsyncDisposable
    {
        private readonly Func<Task> _action;

        private bool _disposed = false;
        private readonly object _disposedLock = new();

        public AsyncActionDisposable(Func<Task> action)
        {
            Guard.Argument(action, nameof(action)).NotNull();
            _action = action;
        }

        public static AsyncActionDisposable NoOp() => new(() => Task.CompletedTask);

        public async ValueTask DisposeAsync()
        {
            if (_disposed)
                return;

            lock (_disposedLock)
            {
                if (_disposed)
                    return;

                _disposed = true;
            }

            await _action().ConfigureAwait(false);
        }
    }
}