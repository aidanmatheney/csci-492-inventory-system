import {QueryList} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {Observable} from 'rxjs';

export const wireUpTable = ({dataSource, sort, paginator}: {
  dataSource: {
    sort: MatSort | null;
    paginator: MatPaginator | null;
  };
  sort?: QueryList<MatSort>;
  paginator?: QueryList<MatPaginator>;
}) => {
  if (sort != null) {
    const setTableSort = () => dataSource.sort = sort.first ?? null;
    setTableSort();
    sort.changes.subscribe(setTableSort);
  }

  if (paginator != null) {
    const setTablePaginator = () => dataSource.paginator = paginator.first ?? null;
    setTablePaginator();
    paginator.changes.subscribe(setTablePaginator);
  }
};

export type RowOf<C, K extends keyof any = 'rows$'> = (
  C extends Readonly<Record<K, Observable<ReadonlyArray<infer R>>>> ? R : never
);
