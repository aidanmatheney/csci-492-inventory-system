namespace InventorySystemServer.Utils
{
    using System;

    public sealed class ActionDisposable : IDisposable
    {
        private readonly Action _action;

        private bool _disposed = false;
        private readonly object _disposedSync = new object();

        public ActionDisposable(Action action)
        {
            Guard.NotNull(action, nameof(action));
            _action = action;
        }

        public static ActionDisposable NoOp() => new ActionDisposable(() => { });

        public void Dispose()
        {
            if (_disposed)
                return;

            lock (_disposedSync)
            {
                if (_disposed)
                    return;

                _disposed = true;
            }

            _action();
        }
    }
}