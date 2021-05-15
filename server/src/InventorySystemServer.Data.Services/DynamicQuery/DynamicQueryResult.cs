namespace InventorySystemServer.Data.Services.DynamicQuery
{
    using System.Collections.Generic;

    public sealed record DynamicQueryResult<T>(long UnfilteredRecordCount, long FilteredRecordCount, IReadOnlyList<T> Records);
}