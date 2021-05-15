namespace InventorySystemServer.Data.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Reflection;

    public static class ReflectionCache<T>
    {
        public static IReadOnlyDictionary<string, PropertyInfo> PublicPropertyByName { get; } = typeof(T).GetProperties().ToDictionary(property => property.Name);
    }
}