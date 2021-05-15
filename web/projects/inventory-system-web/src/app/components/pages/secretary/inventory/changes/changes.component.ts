import {Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChildren, QueryList} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {flatMap} from 'lodash-es';

import {Loadable, selectLoadedValue, selectLoading, switchMapLoadable} from '../../../../../utils/loading';
import {RowOf, wireUpTable} from '../../../../../utils/table';
import {ElementOf} from '../../../../../utils/type';
import {PartialRecord, recordValues} from '../../../../../utils/record';
import {hasNonNullableProperties, someTrue} from '../../../../../utils/filter';
import {startFromAndSaveToLocalStorage} from '../../../../../utils/storage';

import {PageTitleService} from '../../../../../services/page-title.service';
import {CurrentAppUserService} from '../../../../../services/current-app-user.service';
import {InventoryService} from '../../../../../services/inventory.service';
import {AppUsersService} from '../../../../../services/app-users.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

import {OtherAppUser} from '../../../../../models/app-user';

type InventoryChangesForm = FormGroup<{
  filter: FormControl<string, {}>;
}, {}>;

@Component({
  selector: 'inventory-system-inventory-changes',
  templateUrl: './changes.component.html',
  styleUrls: ['./changes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class InventoryChangesComponent implements OnInit, AfterViewInit {
  // Use ViewChildren since these are inside an ngIf
  @ViewChildren(MatSort) private sort!: QueryList<MatSort>;
  @ViewChildren(MatPaginator) private paginator!: QueryList<MatPaginator>;

  public readonly rows$ = combineLatest([
    selectLoadedValue(this.inventoryService.itemHistories$),
    selectLoadedValue(this.inventoryService.itemHistoryById$),
    selectLoadedValue(this.currentAppUserService.isAdministrator$.pipe(
      switchMapLoadable(Loadable.loading, (isAdministrator): (
        Observable<Loadable<PartialRecord<string, OtherAppUser> | undefined>>
      ) => (
        isAdministrator ? this.appUsersService.appUserById$
        : of(Loadable.loaded(undefined))
      ))
    ))
  ]).pipe(
    map(([
      itemHistories,
      itemHistoryById,
      appUserById
    ]) => (flatMap(itemHistories, itemHistory => recordValues(itemHistory.changeBySequence))
      .map(change => ({
        change,
        itemHistory: itemHistoryById[change.itemId],
        appUser: (appUserById == null || change.userId == null) ? undefined : appUserById[change.userId]
      }))
      .filter(hasNonNullableProperties('itemHistory'))
    ))
  );

  public readonly isAdministrator$ = selectLoadedValue(this.currentAppUserService.isAdministrator$);

  public readonly loading$ = combineLatest([
    selectLoading(this.inventoryService.assigneeHistories$),
    selectLoading(this.currentAppUserService.isAdministrator$.pipe(
      switchMapLoadable(Loadable.loading, (isAdministrator): Observable<Loadable<OtherAppUser[] | undefined>> => (
        isAdministrator ? this.appUsersService.appUsers$
        : of(Loadable.loaded(undefined))
      ))
    ))
  ]).pipe(map(someTrue));

  public readonly form: InventoryChangesForm = this.formBuilder.group({
    filter: this.formBuilder.control('')
  });

  public readonly dataSource = new MatTableDataSource<RowOf<InventoryChangesComponent>>();
  public readonly columns = [
    'itemBarcode',
    'itemName',
    'changeSequence',
    'userEmail',
    'date',
    'approved',
  ] as const;

  public readonly nextPageSize$ = new Subject<number>();
  public readonly pageSize$ = this.nextPageSize$.pipe(startFromAndSaveToLocalStorage(
    'inventoryItemChangesTablePageSize',
    pageSize => pageSize,
    pageSize => of(pageSize ?? 10)
  ));

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly currentAppUserService: CurrentAppUserService,
    private readonly inventoryService: InventoryService,
    private readonly appUsersService: AppUsersService,
    private readonly destroyed$: Destroyed$
  ) {
    this.dataSource.sortingDataAccessor = ({change, itemHistory, appUser}, sortHeaderId) => {
      const column = sortHeaderId as ElementOf<InventoryChangesComponent['columns']>;

      if (column === 'itemBarcode') {
        return itemHistory.item.barcode;
      }
      if (column === 'itemName') {
        return itemHistory.lastUndeletedSnapshot.name;
      }
      if (column === 'changeSequence') {
        return change.sequence;
      }
      if (column === 'userEmail') {
        return appUser?.email ?? '';
      }
      if (column === 'date') {
        return change.date.getTime();
      }
      return (
        change.approved == null ? 0
        : !change.approved ? 1
        : 2
      );
    };

    this.dataSource.filterPredicate = ({change, itemHistory, appUser}, filter) => {
      const lowercaseFields = [
        itemHistory.item.barcode,
        itemHistory.lastUndeletedSnapshot.name,
        String(change.sequence),
        appUser?.email ?? ''
      ].map(field => field.toLowerCase());

      const lowercaseFilter = filter.toLowerCase();

      return lowercaseFields.some(field => field.includes(lowercaseFilter));
    };
  }

  public ngOnInit() {
    this.pageTitleService.set('Changes');

    this.rows$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(rows => this.dataSource.data = rows);

    this.form.select(({filter}) => filter).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(filter => this.dataSource.filter = filter);
  }

  public ngAfterViewInit() {
    wireUpTable({
      dataSource: this.dataSource,
      sort: this.sort,
      paginator: this.paginator
    });
  }
}
