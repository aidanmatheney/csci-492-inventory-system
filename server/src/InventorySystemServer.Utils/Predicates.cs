namespace InventorySystemServer.Utils
{
    using System.Diagnostics.CodeAnalysis;

    public static class Predicates
    {
        public static bool IsNull<T>([MaybeNullWhen(true)] T? value) => value is null;
        public static bool IsNotNull<T>([NotNullWhen(true)] T? value) => value is not null;
    }
}