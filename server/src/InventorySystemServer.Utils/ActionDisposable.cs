namespace InventorySystemServer.Utils
{
    using System;

    using Dawn;

    public sealed class ActionDisposable : IDisposable
    {
        private readonly Action _action;

        private bool _disposed = false;
        private readonly object _disposedLock = new();

        public ActionDisposable(Action action)
        {
            Guard.Argument(action, nameof(action)).NotNull();
            _action = action;
        }

        public static ActionDisposable NoOp() => new(() => { });

        public void Dispose()
        {
            if (_disposed)
                return;

            lock (_disposedLock)
            {
                if (_disposed)
                    return;

                _disposed = true;
            }

            _action();
        }
    }
}