namespace InventorySystemServer.Utils
{
    using System;
    using System.Diagnostics;

    using JetBrains.Annotations;

    public static class Guard
    {
        [DebuggerStepThrough]
        public static void True(bool condition, string paramName, string message)
        {
            if (!condition)
            {
                throw new ArgumentException(message, paramName);
            }
        }

        [DebuggerStepThrough]
        public static void NotNull<T>([NoEnumeration] T obj, string paramName)
        {
            if (obj is null)
            {
                throw new ArgumentNullException(paramName);
            }
        }
    }
}