export enum DynamicQueryFilterOperator {
  equalsAny = 'EqualsAny',
  containsAny = 'ContainsAny',
  range = 'Range'
}

export interface DynamicQueryFilterParameter<T> {
  field: keyof T & string;
  operator: DynamicQueryFilterOperator;
  arguments: Array<string | boolean | number | Date | undefined>;
}
export type DynamicQueryFilterParameterDto<T> = Omit<DynamicQueryFilterParameter<T>, 'arguments'> & {
  arguments: Array<string | undefined>;
};


export enum DynamicQuerySortDirection {
  ascending = 'Ascending',
  descending = 'Descending'
}

export interface DynamicQuerySortParameter<T> {
  field: keyof T & string;
  direction: DynamicQuerySortDirection;
}


export interface DynamicQueryPaginationParameter {
  startIndex?: number;
  length?: number;
}


export interface DynamicQueryParameters<T> {
  filters?: DynamicQueryFilterParameter<T>[];
  sorts?: DynamicQuerySortParameter<T>[];
  pagination?: DynamicQueryPaginationParameter;
}
export type DynamicQueryParametersDto<T> = Omit<DynamicQueryParameters<T>, 'filters'> & {
  filters?: DynamicQueryFilterParameterDto<T>[];
};


export interface DynamicQueryResult<T> {
  unfilteredRecordCount: number;
  filteredRecordCount: number;
  records: T[];
}
