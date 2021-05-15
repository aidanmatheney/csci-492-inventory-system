namespace InventorySystemServer.Utils
{
    using Dawn;

    public static class StringUtils
    {
        public static string ToPascalCase(this string value)
        {
            Guard.Argument(value, nameof(value)).NotNull();

            if (value.Length == 0)
            {
                return value;
            }

            return $"{char.ToUpper(value[0])}{value[1..]}";
        }
    }
}