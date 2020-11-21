namespace InventorySystemServer.Utils
{
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Linq;

    public static class EnumerableUtils
    {
        public static IEnumerable<(T Element, int Index)> Index<T>(this IEnumerable<T> source)
        {
            Guard.NotNull(source, nameof(source));

            var index = 0;
            foreach (var element in source)
            {
                yield return (element, index);
                index += 1;
            }
        }

        public static IEnumerable<T> Repeat<T>(this IReadOnlyCollection<T> source, int count)
        {
            Guard.NotNull(source, nameof(source));
            Guard.True(count >= 0, nameof(count), $"{nameof(count)} must be >= 0");

            for (var i = 0; i < count; i += 1)
            {
                foreach (var element in source)
                    yield return element;
            }
        }

        public static IEnumerable<T> ConcatMany<T>(this IEnumerable<T> first, params IEnumerable<T>[] others)
        {
            Guard.NotNull(first, nameof(first));
            Guard.NotNull(others, nameof(others));

            return others.Aggregate(first, (concatenated, current) => concatenated.Concat(current));
        }

        public static IEnumerable<T> Dequeue<T>(T firstItem, ConcurrentQueue<T> nextItems)
        {
            Guard.NotNull(nextItems, nameof(nextItems));

            yield return firstItem;
            while (nextItems.TryDequeue(out var nextItem))
            {
                yield return nextItem;
            }
        }
    }
}