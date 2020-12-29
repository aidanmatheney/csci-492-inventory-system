import {Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {of} from 'rxjs';
import {delay, startWith, takeUntil} from 'rxjs/operators';

import {PageTitleService} from '../../../../services/page-title.service';
import {Destroyed$} from '../../../../services/destroyed$.service';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  cost: number;
}

@Component({
  selector: 'inventory-system-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class InventoryComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) private sort!: MatSort;
  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  public readonly loading$ = of(false).pipe(delay(1000), startWith(true));
  public readonly inventoryItems$ = of<InventoryItem[]>([
    {id: 'aaa', name: 'Dell keyboard', category: 'Electronics', cost: 30},
    {id: 'aab', name: 'Dell mouse', category: 'Electronics', cost: 20},
    {id: 'aac', name: 'Dell monitor', category: 'Electronics', cost: 150}
  ]);

  public readonly dataSource = new MatTableDataSource<InventoryItem>();
  public readonly columns: ReadonlyArray<keyof InventoryItem> = [
    'id',
    'name',
    'category',
    'cost'
  ];

  public constructor(
    private readonly pageTitleService: PageTitleService,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Inventory');

    this.inventoryItems$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(inventoryItems => this.dataSource.data = inventoryItems);
  }

  public ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
