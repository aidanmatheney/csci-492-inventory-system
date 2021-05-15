namespace InventorySystemServer.Utils
{
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;

    using Dawn;

    public static class CollectionUtils
    {
        public static TValue GetOrAdd<TKey, TValue>(this IDictionary<TKey, TValue> dict, TKey key, TValue defaultValue)
        {
            Guard.Argument(dict, nameof(dict)).NotNull();

            if (dict.TryGetValue(key, out var value))
            {
                return value;
            }

            dict[key] = defaultValue;
            return defaultValue;
        }

        public static TValue GetOrAdd<TKey, TValue>(this IDictionary<TKey, TValue> dict, TKey key, Func<TKey, TValue> defaultValueFactory)
        {
            Guard.Argument(dict, nameof(dict)).NotNull();

            if (dict.TryGetValue(key, out var value))
            {
                return value;
            }

            var defaultValue = defaultValueFactory(key);
            dict[key] = defaultValue;
            return defaultValue;
        }

        public static TValue GetOrAdd<TKey, TValue, TArgument>(this IDictionary<TKey, TValue> dict, TKey key, Func<TKey, TArgument, TValue> defaultValueFactory, TArgument defaultValueFactoryArgument)
        {
            Guard.Argument(dict, nameof(dict)).NotNull();

            if (dict.TryGetValue(key, out var value))
            {
                return value;
            }

            var defaultValue = defaultValueFactory(key, defaultValueFactoryArgument);
            dict[key] = defaultValue;
            return defaultValue;
        }

        public static List<T> Dequeue<T>(T firstItem, ConcurrentQueue<T> nextItems)
        {
            Guard.Argument(nextItems, nameof(nextItems)).NotNull();

            var items = new List<T>(nextItems.Count + 1) { firstItem };
            while (nextItems.TryDequeue(out var nextItem))
            {
                items.Add(nextItem);
            }
            return items;
        }
    }
}