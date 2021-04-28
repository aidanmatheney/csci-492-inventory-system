import {Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChildren, QueryList} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {map, takeUntil} from 'rxjs/operators';

import {selectLoadedValue, selectLoading} from '../../../../utils/loading';
import {isNotFalse} from '../../../../utils/filter';
import {wireUpTable} from '../../../../utils/table';
import {ElementOf} from '../../../../utils/type';

import {PageTitleService} from '../../../../services/page-title.service';
import {InventoryService} from '../../../../services/inventory.service';
import {Destroyed$} from '../../../../services/destroyed$.service';

import {InventoryItemHistory} from '../../../../models/inventory';

type InventoryForm = FormGroup<{
  filter: FormControl<string, {}>;
}, {}>;

@Component({
  selector: 'inventory-system-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class InventoryComponent implements OnInit, AfterViewInit {
  // Use ViewChildren since these are inside an ngIf
  @ViewChildren(MatSort) private sort!: QueryList<MatSort>;
  @ViewChildren(MatPaginator) private paginator!: QueryList<MatPaginator>;

  public readonly itemHistories$ = selectLoadedValue(this.inventoryService.itemHistories$).pipe(
    map(itemHistories => itemHistories.filter(({currentSnapshot}) => currentSnapshot != null))
  );
  public readonly loading$ = selectLoading(this.inventoryService.itemHistories$);

  public readonly form: InventoryForm = this.formBuilder.group({
    filter: this.formBuilder.control('')
  });

  public readonly dataSource = new MatTableDataSource<InventoryItemHistory>();
  public readonly columns = [
    'id',
    'barcode',
    'name',
    'category',
    'cost',
    'flagged'
  ] as const;

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly inventoryService: InventoryService,
    private readonly destroyed$: Destroyed$
  ) {
    this.dataSource.sortingDataAccessor = ({item, lastUndeletedSnapshot}, sortHeaderId) => {
      const column = sortHeaderId as ElementOf<InventoryComponent['columns']>;

      if (column === 'id' || column === 'barcode') {
        return item[column];
      }

      if (column === 'flagged') {
        return lastUndeletedSnapshot.flaggedReason != null ? 1 : 0;
      }

      return lastUndeletedSnapshot[column] ?? '';
    };

    this.dataSource.filterPredicate = ({item, lastUndeletedSnapshot}, filter) => {
      const lowercaseFields = [
        String(item.id),
        item.barcode,
        lastUndeletedSnapshot.name,
        lastUndeletedSnapshot.category != null && lastUndeletedSnapshot.category,
        lastUndeletedSnapshot.cost != null && String(lastUndeletedSnapshot.cost)
      ].filter(isNotFalse).map(field => field.toLowerCase());

      const lowercaseFilter = filter.toLowerCase();

      return lowercaseFields.some(field => field.includes(lowercaseFilter));
    };
  }

  public ngOnInit() {
    this.pageTitleService.set('Inventory');

    this.itemHistories$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(itemHistories => this.dataSource.data = itemHistories);

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
