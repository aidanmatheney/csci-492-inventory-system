namespace InventorySystemServer.Utils
{
    using System.Collections.Generic;
    using System.Linq;

    using Dawn;

    public static class EnumerableUtils
    {
        public static IEnumerable<(T Value, int Index)> Index<T>(this IEnumerable<T> source)
        {
            Guard.Argument(source, nameof(source)).NotNull();

            var index = 0;
            foreach (var element in source)
            {
                yield return (element, index);
                index += 1;
            }
        }

        public static IEnumerable<T> Repeat<T>(this IReadOnlyCollection<T> source, int count)
        {
            Guard.Argument(source, nameof(source)).NotNull();
            Guard.Argument(count, nameof(count)).NotNegative();

            for (var i = 0; i < count; i += 1)
            {
                foreach (var element in source)
                {
                    yield return element;
                }
            }
        }

        public static IEnumerable<T> ConcatMany<T>(this IEnumerable<T> first, params IEnumerable<T>[] others)
        {
            Guard.Argument(first, nameof(first)).NotNull();
            Guard.Argument(others, nameof(others)).NotNull();

            return others.Aggregate(first, Enumerable.Concat);
        }

        public static string Join(this IEnumerable<string> source, string separator = "")
            => string.Join(separator, source);
    }
}