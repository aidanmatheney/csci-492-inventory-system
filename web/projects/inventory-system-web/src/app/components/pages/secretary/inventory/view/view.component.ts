import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, Observable, of} from 'rxjs';
import {filter, map, pluck, startWith, switchMap, takeUntil} from 'rxjs/operators';

import {selectInitialLoading, selectLoadedValue} from '../../../../../utils/loading';
import {cacheUntil, firstValueFrom} from '../../../../../utils/observable';
import {isNotNull, isNull, someTrue} from '../../../../../utils/filter';
import {stringToNumber} from '../../../../../utils/number';

import {PageTitleService} from '../../../../../services/page-title.service';
import {InventoryService} from '../../../../../services/inventory.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

@Component({
  selector: 'inventory-system-view-inventory-item',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class ViewInventoryItemComponent implements OnInit {
  public readonly viewItemId$ = (this.route.params as Observable<{
    id: string;
  }>).pipe(
    pluck('id'),
    map(stringToNumber)
  );
  public readonly viewItemHistory$ = this.viewItemId$.pipe(
    switchMap(viewItemId => (viewItemId == null
      ? of(undefined)
      : selectLoadedValue(this.inventoryService.selectItemHistoryById(viewItemId))
    )),
    cacheUntil(this.destroyed$)
  );
  public readonly viewItemAssigneeHistory$ = this.viewItemHistory$.pipe(
    switchMap(viewItemHistory => ((viewItemHistory == null || viewItemHistory.lastUndeletedSnapshot.assigneeId == null)
      ? of(undefined)
      : selectLoadedValue(
        this.inventoryService.selectAssigneeHistoryById(viewItemHistory.lastUndeletedSnapshot.assigneeId)
      )
    )),
    cacheUntil(this.destroyed$)
  );

  public readonly loading$ = combineLatest([
    selectInitialLoading(this.inventoryService.itemHistories$),
    this.viewItemHistory$.pipe(startWith(undefined)).pipe(map(isNull)),
    selectInitialLoading(this.inventoryService.assigneeHistories$)
  ]).pipe(map(someTrue));

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService,
    private readonly inventoryService: InventoryService,
    private readonly destroyed$: Destroyed$
  ) { }

  public async ngOnInit() {
    this.pageTitleService.set('View Inventory Item');
    this.viewItemHistory$.pipe(
      filter(isNotNull),
      takeUntil(this.destroyed$)
    ).subscribe(viewItemHistory => {
      this.pageTitleService.set(`View Inventory Item - ${viewItemHistory.lastUndeletedSnapshot.name}`);
    });

    const viewItemHistory = await firstValueFrom(this.viewItemHistory$);
    if (viewItemHistory == null || viewItemHistory.currentSnapshot == null) {
      await this.router.navigate(['..'], {relativeTo: this.route});
    }
  }
}
