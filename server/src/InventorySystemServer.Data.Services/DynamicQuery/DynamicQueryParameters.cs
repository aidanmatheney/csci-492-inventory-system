namespace InventorySystemServer.Data.Services.DynamicQuery
{
    using System.Collections.Generic;

    public sealed record DynamicQueryParameters(IReadOnlyList<DynamicQueryFilterParameter>? Filters, IReadOnlyList<DynamicQuerySortParameter>? Sorts, DynamicQueryPaginationParameter? Pagination);
}