import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, Observable, of} from 'rxjs';
import {filter, map, pluck, startWith, switchMap, takeUntil} from 'rxjs/operators';

import {selectInitialLoading, selectLoadedValue} from '../../../../../../utils/loading';
import {firstValueFrom} from '../../../../../../utils/observable';
import {isNotNull} from '../../../../../../utils/filter';
import {stringToNumber} from '../../../../../../utils/number';

import {PageTitleService} from '../../../../../../services/page-title.service';
import {InventoryService} from '../../../../../../services/inventory.service';
import {Destroyed$} from '../../../../../../services/destroyed$.service';

@Component({
  selector: 'inventory-system-view-inventory-assignee',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewInventoryAssigneeeComponent implements OnInit {
  public readonly viewAssigneeeId$ = (this.route.params as Observable<{
    id: string;
  }>).pipe(
    pluck('id'),
    map(stringToNumber)
  );

  public readonly viewAssigneeeHistory$ = this.viewAssigneeeId$.pipe(
    switchMap(viewAssigneeeId => (viewAssigneeeId == null
      ? of(undefined)
      : selectLoadedValue(this.inventoryService.selectAssigneeHistoryById(viewAssigneeeId))
    ))
  );
  public readonly loading$ = combineLatest([
    selectInitialLoading(this.inventoryService.assigneeHistories$),
    this.viewAssigneeeHistory$.pipe(startWith(undefined))
  ]).pipe(map(([assigneeHistoriesLoading, viewAssigneeeHistory]) => (
    assigneeHistoriesLoading
    || viewAssigneeeHistory == null
  )));

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService,
    private readonly inventoryService: InventoryService,
    private readonly destroyed$: Destroyed$
  ) { }

  public async ngOnInit() {
    this.pageTitleService.set('View Inventory Assignee');
    this.viewAssigneeeHistory$.pipe(
      filter(isNotNull),
      takeUntil(this.destroyed$)
    ).subscribe(viewAssigneeeHistory => {
      this.pageTitleService.set(`View Inventory Assignee - ${viewAssigneeeHistory.lastUndeletedSnapshot.name}`);
    });

    const viewAssigneeeHistory = await firstValueFrom(this.viewAssigneeeHistory$);
    if (viewAssigneeeHistory == null || viewAssigneeeHistory.currentSnapshot == null) {
      await this.router.navigate(['..'], {relativeTo: this.route});
    }
  }
}
