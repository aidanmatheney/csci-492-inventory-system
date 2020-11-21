namespace InventorySystemServer.Utils
{
    using System;
    using System.Threading.Tasks;

    public sealed class AsyncLazy<T> : Lazy<Task<T>>
    {
        public AsyncLazy() { }
        public AsyncLazy(T value) : base(Task.FromResult(value)) { }
        public AsyncLazy(Func<Task<T>> createValueAsync) : base(createValueAsync) { }
    }
}