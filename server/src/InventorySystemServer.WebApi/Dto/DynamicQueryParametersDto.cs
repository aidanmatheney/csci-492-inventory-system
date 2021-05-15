namespace InventorySystemServer.WebApi.Dto
{
    using System.Collections.Generic;
    using System.Linq;

    using InventorySystemServer.Data.Services.DynamicQuery;
    using InventorySystemServer.Utils;

    public sealed record DynamicQueryParametersDto(IReadOnlyList<DynamicQueryFilterParameter>? Filters, IReadOnlyList<DynamicQuerySortParameter>? Sorts, DynamicQueryPaginationParameter? Pagination)
    {
        public DynamicQueryParameters ToParameters() => new
        (
            Filters: Filters?.Select(filter => filter with { Field = filter.Field.ToPascalCase() }).ToList(),
            Sorts: Sorts?.Select(sort => sort with { Field = sort.Field.ToPascalCase() }).ToList(),
            Pagination: Pagination
        );
    }
}