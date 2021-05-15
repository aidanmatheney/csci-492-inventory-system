namespace InventorySystemServer.Utils
{
    using System;

    public static class DateUtils
    {
        public static bool ApproximatelyEquals(this DateTimeOffset date1, DateTimeOffset date2, long ticksEpsilon = 100)
        {
            var ticksDifference = (date1 - date2).Ticks;
            return Math.Abs(ticksDifference) < ticksEpsilon;
        }
    }
}