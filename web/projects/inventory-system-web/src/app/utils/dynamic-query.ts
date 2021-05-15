import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {distinctUntilChanged, filter, map, pluck, startWith, switchMap, takeUntil} from 'rxjs/operators';

import {VOID} from './type';
import {cacheUntil} from './observable';
import {Loadable, selectLoadedValue, selectLoading} from './loading';
import {isNotNull} from './filter';

import {
  DynamicQueryFilterParameter,
  DynamicQueryPaginationParameter,
  DynamicQueryParameters,
  DynamicQueryParametersDto,
  DynamicQueryResult,
  DynamicQuerySortDirection,
  DynamicQuerySortParameter
} from '../models/dynamic-query';

const defaultPagination: DynamicQueryPaginationParameter = {startIndex: 0, length: 10};

export class DynamicQueryDataSource<T> extends DataSource<T> {
  private readonly filters$ = new BehaviorSubject<DynamicQueryFilterParameter<T>[] | undefined>(undefined);
  private readonly sortComponent$ = new BehaviorSubject<MatSort | null>(null);
  private readonly paginatorComponent$ = new BehaviorSubject<MatPaginator | null>(null);

  private readonly refresh$ = new Subject<void>();

  private readonly queryResult$ = combineLatest([
    this.filters$,
    this.sortComponent$.pipe(
      switchMap((sortComponent): Observable<DynamicQuerySortParameter<T> | undefined> => (
        sortComponent == null ? of(undefined)
        : sortComponent.sortChange.pipe(
          startWith({
            active: sortComponent.active as string | undefined,
            direction: sortComponent.direction
          }),
          map(({active, direction}) => (
            (active == null || direction === '') ? undefined
            : ({
              field: active as keyof T & string,
              direction: (
                direction === 'asc' ? DynamicQuerySortDirection.ascending : DynamicQuerySortDirection.descending
              )
            })
          )))
        )
      ),
      distinctUntilChanged()
    ),
    this.paginatorComponent$.pipe(
      switchMap((paginatorComponent): Observable<DynamicQueryPaginationParameter> => (
        paginatorComponent == null ? of(defaultPagination)
        : paginatorComponent.page.pipe(
          startWith({
            pageIndex: paginatorComponent.pageIndex,
            pageSize: paginatorComponent.pageSize
          }),
          map(({pageIndex, pageSize}) => ({
            startIndex: pageIndex * pageSize,
            length: pageSize
          }))
        )
      )),
      distinctUntilChanged()
    ),
    this.refresh$.pipe(startWith(VOID))
  ]).pipe(
    switchMap(([filters, sort, pagination]) => this.dynamicQuery({
      filters,
      sorts: sort == null ? undefined : [sort],
      pagination
    })),
    cacheUntil(this.destroy$)
  );
  private readonly records$ = selectLoadedValue(this.queryResult$).pipe(pluck('records'));

  public readonly loading$ = selectLoading(this.queryResult$);

  public constructor(
    private readonly dynamicQuery: (
      (parameters: DynamicQueryParameters<T>) => Observable<Loadable<DynamicQueryResult<T>>>
    ),
    private readonly destroy$: Observable<void>
  ) {
    super();

    combineLatest([
      selectLoadedValue(this.queryResult$),
      this.paginatorComponent$.pipe(filter(isNotNull))
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([queryResult, paginatorComponent]) => {
      paginatorComponent.length = queryResult.filteredRecordCount;
    });
  }

  public get filters() { return this.filters$.value; }
  public set filters(value: DynamicQueryFilterParameter<T>[] | undefined) { this.filters$.next(value); }

  public get sort() { return this.sortComponent$.value; }
  public set sort(value: MatSort | null) { this.sortComponent$.next(value); }

  public get paginator() { return this.paginatorComponent$.value; }
  public set paginator(value: MatPaginator | null) { this.paginatorComponent$.next(value); }

  public connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.records$;
  }

  public disconnect(collectionViewer: CollectionViewer) { }

  public refresh() {
    this.refresh$.next();
  }
}

export const dynamicQueryParametersToDto = <T>(
  parameters: DynamicQueryParameters<T>
): DynamicQueryParametersDto<T> => ({
  ...parameters,
  filters: parameters.filters?.map(filter => ({
    ...filter,
    arguments: filter.arguments.map(arg => {
      if (arg == null) {
        return undefined;
      }
      if (typeof arg === 'string') {
        return arg;
      }
      if (typeof arg === 'boolean' || typeof arg === 'number') {
        return String(arg);
      }
      // arg instanceof Date
      return arg.toISOString();
    })
  }))
});
