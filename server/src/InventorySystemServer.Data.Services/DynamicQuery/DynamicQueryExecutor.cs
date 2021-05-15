namespace InventorySystemServer.Data.Services.DynamicQuery
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Linq.Dynamic.Core;
    using System.Linq.Expressions;
    using System.Threading;
    using System.Threading.Tasks;

    using Dawn;

    using InventorySystemServer.Utils;

    using Microsoft.EntityFrameworkCore;

    public sealed class DynamicQueryExecutor<TEntity>
    {
        private static readonly IReadOnlySet<Type> NumericTypes = new[]
        {
            typeof(int),
            typeof(long),
            typeof(float),
            typeof(double),
            typeof(DateTime),
            typeof(DateTimeOffset)
        }.ToHashSet();

        private sealed record SortValueJoinInfo(string Field, IEnumerable SortEntities, string SortEntityKeyPropertyName, string SortEntityValuePropertyName);

        public sealed class Builder
        {
            private readonly List<SortValueJoinInfo> _sortValueJoinInfos = new();
            private int _maxPaginationLength = 100;

            public Builder SortValue<TField, TSortEntity, TSortValue>
            (
                Expression<Func<TEntity, TField>> fieldSelector,
                DbSet<TSortEntity> sortEntities,
                Expression<Func<TSortEntity, TField>> sortEntityKeySelector,
                Expression<Func<TSortEntity, TSortValue>> sortEntityValueSelector
            ) where TSortEntity : class
            {
                var field = fieldSelector.GetImmediatePropertyName();
                var sortEntityKeyPropertyName = sortEntityKeySelector.GetImmediatePropertyName();
                var sortEntityValuePropertyName = sortEntityValueSelector.GetImmediatePropertyName();

                if (!NumericTypes.Contains(typeof(TSortValue)))
                {
                    throw new ArgumentException($"Sort value selector must select a numeric property (not {sortEntityValuePropertyName} of type {typeof(TSortValue).FullName})", nameof(sortEntityValueSelector));
                }

                _sortValueJoinInfos.Add(new SortValueJoinInfo(field, sortEntities, sortEntityKeyPropertyName, sortEntityValuePropertyName));

                return this;
            }

            public Builder MaxPaginationLength(int value)
            {
                Guard.Argument(value, nameof(value)).Min(1);
                _maxPaginationLength = value;
                return this;
            }

            public DynamicQueryExecutor<TEntity> Build() => new
            (
                _sortValueJoinInfos.Count == 0 ? null : _sortValueJoinInfos.ToDictionary(info => info.Field),
                _maxPaginationLength
            );
        }

        private readonly IReadOnlyDictionary<string, SortValueJoinInfo>? _sortValueJoinInfoByField;
        private readonly int _maxPaginationLength;

        private DynamicQueryExecutor(IReadOnlyDictionary<string, SortValueJoinInfo>? sortValueJoinInfoByField, int maxPaginationLength)
        {
            _sortValueJoinInfoByField = sortValueJoinInfoByField;
            _maxPaginationLength = maxPaginationLength;
        }

        public async Task<DynamicQueryResult<TEntity>> QueryAsync(IQueryable<TEntity> queryable, DynamicQueryParameters parameters, CancellationToken cancellationToken = default)
        {
            Guard.Argument(queryable, nameof(queryable)).NotNull();
            Guard.Argument(parameters, nameof(parameters)).NotNull();

            var joinEntitySortValues = (
                _sortValueJoinInfoByField is not null
                && (
                    (parameters.Filters?.Any(filter => _sortValueJoinInfoByField.ContainsKey(filter.Field)) ?? false)
                    || (parameters.Sorts?.Any(sort => _sortValueJoinInfoByField.ContainsKey(sort.Field)) ?? false)
                )
            );
            IQueryable possiblyJoinedQueryable = queryable;
            if (joinEntitySortValues)
            {
                var fieldsWhoseSortValuesToJoin = Enumerable.Concat
                (
                    parameters.Filters?.Select(filter => filter.Field) ?? Enumerable.Empty<string>(),
                    parameters.Sorts?.Select(sort => sort.Field) ?? Enumerable.Empty<string>()
                ).Distinct().Where(field => _sortValueJoinInfoByField!.ContainsKey(field)).ToList();

                possiblyJoinedQueryable = fieldsWhoseSortValuesToJoin.Index().Aggregate(possiblyJoinedQueryable, (currentQueryable, indexedField) =>
                {
                    var (field, index) = indexedField;
                    var (_, sortEntities, sortEntityKeyPropertyName, sortEntityValuePropertyName) = _sortValueJoinInfoByField![field];

                    return currentQueryable.Join
                    (
                        sortEntities,
                        index == 0 ? field : $"Entity.{field}",
                        sortEntityKeyPropertyName,
                        @$"
new(
    {(index == 0 ? "outer" : "outer.Entity")} as Entity,
    new(
        {fieldsWhoseSortValuesToJoin.Take(index).Select(previousField => $"outer.EntitySortValues.{previousField}, ").Join()}
        inner.{sortEntityValuePropertyName} as {field}
    ) as EntitySortValues
)
                        "
                    );
                });
            }

            var fieldPropertyByName = ReflectionCache<TEntity>.PublicPropertyByName;

            if (parameters.Filters is not null)
            {
                foreach (var (fieldName, op, arguments) in parameters.Filters)
                {
                    if (!fieldPropertyByName.TryGetValue(fieldName, out var fieldProperty))
                    {
                        throw new ArgumentException($"Entity type does not have a public property named {fieldName}", nameof(parameters));
                    }

                    var fieldType = fieldProperty.PropertyType;
                    object?[] parsedArguments;
                    if (fieldType == typeof(string))
                    {
                        parsedArguments = arguments.Cast<object?>().ToArray();
                    }
                    else if (fieldType == typeof(int))
                    {
                        parsedArguments = arguments.Select(value => value is null ? default(int?) : int.Parse(value)).Cast<object?>().ToArray();
                    }
                    else if (fieldType == typeof(long))
                    {
                        parsedArguments = arguments.Select(value => value is null ? default(long?) : long.Parse(value)).Cast<object?>().ToArray();
                    }
                    else if (fieldType == typeof(float))
                    {
                        parsedArguments = arguments.Select(value => value is null ? default(float?) : float.Parse(value)).Cast<object?>().ToArray();
                    }
                    else if (fieldType == typeof(double))
                    {
                        parsedArguments = arguments.Select(value => value is null ? default(double?) : double.Parse(value)).Cast<object?>().ToArray();
                    }
                    else if (fieldType == typeof(bool))
                    {
                        parsedArguments = arguments.Select(value => value is null ? default(bool?) : bool.Parse(value)).Cast<object?>().ToArray();
                    }
                    else if (fieldType == typeof(DateTime))
                    {
                        parsedArguments = arguments.Select(value => value is null ? default(DateTime?) : DateTime.Parse(value)).Cast<object?>().ToArray();
                    }
                    else if (fieldType == typeof(DateTimeOffset))
                    {
                        parsedArguments = arguments.Select(value => value is null ? default(DateTimeOffset?) : DateTimeOffset.Parse(value)).Cast<object?>().ToArray();
                    }
                    else
                    {
                        throw new ArgumentException($"Field type {fieldType.FullName} is not supported (field: {fieldName})", nameof(parameters));
                    }

                    var joinArgumentSortValues = (
                        (_sortValueJoinInfoByField?.ContainsKey(fieldName) ?? false)
                        && (op == DynamicQueryFilterOperator.Range && parsedArguments.Any(Predicates.IsNotNull))
                    );
                    if (joinArgumentSortValues)
                    {
                        var (_, sortEntities, sortEntityKeyPropertyName, sortEntityValuePropertyName) = _sortValueJoinInfoByField![fieldName];

                        possiblyJoinedQueryable = parsedArguments.Index().Aggregate(possiblyJoinedQueryable, (currentQueryable, indexedParsedArgument) =>
                        {
                            var (parsedArgument, argumentIndex) = indexedParsedArgument;
                            if (parsedArgument is null)
                            {
                                return currentQueryable;
                            }

                            return currentQueryable.Join
                            (
                                sortEntities,
                                "@0",
                                sortEntityKeyPropertyName,
                                @$"
new(
    outer.Entity,
    outer.EntitySortValues,
    new(
        {Enumerable.Range(0, argumentIndex).Where(previousArgumentIndex => parsedArguments[previousArgumentIndex] is not null).Select(previousArgumentIndex => $"outer.FilterArgumentSortValues.Arg{previousArgumentIndex}, ").Join()}
        inner.{sortEntityValuePropertyName} as Arg{argumentIndex}
    ) as FilterArgumentSortValues
)
                                ",
                                parsedArgument
                            );
                        });
                    }

                    var argumentIndexes = Enumerable.Range(0, parsedArguments.Length);
                    string predicate;
                    object?[] predicateArgs;
                    if (op == DynamicQueryFilterOperator.EqualsAny)
                    {
                        if (parsedArguments.Length == 0)
                        {
                            continue;
                        }

                        predicate = argumentIndexes.Select(index => $"{(joinEntitySortValues ? "Entity." : "")}{fieldName} == @{index}").Join(" || ");
                        predicateArgs = parsedArguments;
                    }
                    else if (op == DynamicQueryFilterOperator.ContainsAny)
                    {
                        if (fieldType != typeof(string))
                        {
                            throw new ArgumentException($"{nameof(DynamicQueryFilterOperator.ContainsAny)} operator can only be used on string fields (not on {fieldName} of type {fieldType.FullName})", nameof(parameters));
                        }

                        if (parsedArguments.Length == 0)
                        {
                            continue;
                        }

                        predicate = argumentIndexes.Select(index => $"{(joinEntitySortValues ? "Entity." : "")}{fieldName}.ToLower().Contains(@{index}.ToLower())").Join(" || ");
                        predicateArgs = parsedArguments;
                    }
                    else
                    {
                        Debug.Assert(op == DynamicQueryFilterOperator.Range);

                        Debug.Assert(parsedArguments.Length == 2); // Validated by DynamicQueryFilterParameter
                        var minInclusive = parsedArguments[0];
                        var maxInclusive = parsedArguments[1];

                        if (minInclusive is null && maxInclusive is null)
                        {
                            continue;
                        }

                        if (joinArgumentSortValues)
                        {
                            if (maxInclusive is null)
                            {
                                predicate = $"EntitySortValues.{fieldName} >= FilterArgumentSortValues.Arg0";
                            }
                            else if (minInclusive is null)
                            {
                                predicate = $"EntitySortValues.{fieldName} <= FilterArgumentSortValues.Arg1";
                            }
                            else
                            {
                                predicate = $"EntitySortValues.{fieldName} >= FilterArgumentSortValues.Arg0 && EntitySortValues.{fieldName} <= FilterArgumentSortValues.Arg1";
                            }

                            predicateArgs = Array.Empty<object?>();
                        }
                        else
                        {
                            if (!NumericTypes.Contains(fieldType))
                            {
                                throw new ArgumentException($"{nameof(DynamicQueryFilterOperator.Range)} operator can only be used on numeric fields unless a sort value table is specified (field {fieldName} of type {fieldType.FullName})", nameof(parameters));
                            }

                            if (maxInclusive is null)
                            {
                                predicate = $"{(joinEntitySortValues ? "Entity." : "")}{fieldName} >= @0";
                                predicateArgs = new[] { minInclusive };
                            }
                            else if (minInclusive is null)
                            {
                                predicate = $"{(joinEntitySortValues ? "Entity." : "")}{fieldName} <= @0";
                                predicateArgs = new[] { maxInclusive };
                            }
                            else
                            {
                                predicate = $"{(joinEntitySortValues ? "Entity." : "")}{fieldName} >= @0 && {(joinEntitySortValues ? "Entity." : "")}{fieldName} <= @1";
                                predicateArgs = parsedArguments;
                            }
                        }
                    }

                    possiblyJoinedQueryable = possiblyJoinedQueryable.Where(predicate, predicateArgs);
                    if (joinArgumentSortValues)
                    {
                        // Remove the current filter's FilterArgumentSortValues
                        possiblyJoinedQueryable = possiblyJoinedQueryable.Select("new(Entity, EntitySortValues)");
                    }
                }
            }

            if (parameters.Sorts?.Any() ?? false)
            {
                var orderByExpression = parameters.Sorts.Select(sort =>
                {
                    var (field, direction) = sort;
                    if (!fieldPropertyByName.ContainsKey(field))
                    {
                        throw new ArgumentException($"Entity type does not have a public property named {field}", nameof(parameters));
                    }

                    return $"{(!joinEntitySortValues ? "" : _sortValueJoinInfoByField!.ContainsKey(field) ? "EntitySortValues." : "Entity.")}{field}{(direction == DynamicQuerySortDirection.Ascending ? "" : " desc")}";
                }).Join(", ");
                possiblyJoinedQueryable = possiblyJoinedQueryable.OrderBy(orderByExpression);
            }

            var filteredAndSortedQueryable = joinEntitySortValues ? possiblyJoinedQueryable.Select<TEntity>("Entity") : (IQueryable<TEntity>)possiblyJoinedQueryable;

            var finalQueryable = filteredAndSortedQueryable;
            if (parameters.Pagination?.StartIndex is not null)
            {
                finalQueryable = finalQueryable.Skip(parameters.Pagination.StartIndex.Value);
            }

            if (parameters.Pagination?.Length is null)
            {
                finalQueryable = finalQueryable.Take(_maxPaginationLength);
            }
            else
            {
                if (parameters.Pagination.Length > _maxPaginationLength)
                {
                    throw new ArgumentException($"Pagination length ({parameters.Pagination.Length}) exceeds max pagination length ({_maxPaginationLength})", nameof(parameters));
                }

                finalQueryable = finalQueryable.Take(parameters.Pagination.Length.Value);
            }

            var unfilteredRecordCount = await queryable.LongCountAsync(cancellationToken).ConfigureAwait(false);
            var filteredRecordCount = await filteredAndSortedQueryable.LongCountAsync(cancellationToken).ConfigureAwait(false);
            var records = await finalQueryable.ToListAsync(cancellationToken).ConfigureAwait(false);

            return new DynamicQueryResult<TEntity>(unfilteredRecordCount, filteredRecordCount, records);
        }
    }
}