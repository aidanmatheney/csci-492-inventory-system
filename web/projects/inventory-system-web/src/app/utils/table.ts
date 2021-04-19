import {QueryList} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';

export const wireUpTable = <T>({dataSource, sort, paginator}: {
  dataSource: MatTableDataSource<T>;
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
