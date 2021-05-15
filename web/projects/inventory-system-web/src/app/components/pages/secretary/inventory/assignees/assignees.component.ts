import {Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChildren, QueryList} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {of, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

import {selectLoadedValue, selectLoading} from '../../../../../utils/loading';
import {wireUpTable} from '../../../../../utils/table';
import {ElementOf} from '../../../../../utils/type';
import {startFromAndSaveToLocalStorage} from '../../../../../utils/storage';

import {PageTitleService} from '../../../../../services/page-title.service';
import {InventoryService} from '../../../../../services/inventory.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

import {InventoryAssigneeHistory} from '../../../../../models/inventory';

type InventoryAssigneesForm = FormGroup<{
  filter: FormControl<string, {}>;
}, {}>;

@Component({
  selector: 'inventory-system-inventory-assignees',
  templateUrl: './assignees.component.html',
  styleUrls: ['./assignees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class InventoryAssigneesComponent implements OnInit, AfterViewInit {
  // Use ViewChildren since these are inside an ngIf
  @ViewChildren(MatSort) private sort!: QueryList<MatSort>;
  @ViewChildren(MatPaginator) private paginator!: QueryList<MatPaginator>;

  public readonly assigneeHistories$ = selectLoadedValue(this.inventoryService.assigneeHistories$).pipe(
    map(assigneeHistories => assigneeHistories.filter(({currentSnapshot}) => currentSnapshot != null))
  );
  public readonly loading$ = selectLoading(this.inventoryService.assigneeHistories$);

  public readonly form: InventoryAssigneesForm = this.formBuilder.group({
    filter: this.formBuilder.control('')
  });

  public readonly dataSource = new MatTableDataSource<InventoryAssigneeHistory>();
  public readonly columns = [
    'id',
    'name',
    'email'
  ] as const;

  public readonly nextPageSize$ = new Subject<number>();
  public readonly pageSize$ = this.nextPageSize$.pipe(startFromAndSaveToLocalStorage(
    'inventoryAssigneesTablePageSize',
    pageSize => pageSize,
    pageSize => of(pageSize ?? 10)
  ));

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly inventoryService: InventoryService,
    private readonly destroyed$: Destroyed$
  ) {
    this.dataSource.sortingDataAccessor = ({assignee, lastUndeletedSnapshot}, sortHeaderId) => {
      const column = sortHeaderId as ElementOf<InventoryAssigneesComponent['columns']>;

      if (column === 'id') {
        return assignee.id;
      }

      return lastUndeletedSnapshot[column];
    };

    this.dataSource.filterPredicate = ({assignee, lastUndeletedSnapshot}, filter) => {
      const lowercaseFields = [
        String(assignee.id),
        lastUndeletedSnapshot.name,
        lastUndeletedSnapshot.email
      ].map(field => field.toLowerCase());

      const lowercaseFilter = filter.toLowerCase();

      return lowercaseFields.some(field => field.includes(lowercaseFilter));
    };
  }

  public ngOnInit() {
    this.pageTitleService.set('Assignees');

    this.assigneeHistories$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(assigneeHistories => this.dataSource.data = assigneeHistories);

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
