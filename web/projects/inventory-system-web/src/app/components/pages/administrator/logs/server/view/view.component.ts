import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, Observable, of} from 'rxjs';
import {filter, map, pluck, startWith, switchMap, takeUntil} from 'rxjs/operators';

import {Loadable, selectInitialLoading, selectLoadedValue} from '../../../../../../utils/loading';
import {cacheUntil, firstValueFrom} from '../../../../../../utils/observable';
import {isNotNull, isNull, someTrue} from '../../../../../../utils/filter';
import {stringToNumber} from '../../../../../../utils/number';

import {PageTitleService} from '../../../../../../services/page-title.service';
import {LogsService} from '../../../../../../services/logs.service';
import {Destroyed$} from '../../../../../../services/destroyed$.service';

@Component({
  selector: 'inventory-system-view-server-log-entry',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class ViewServerLogEntryComponent implements OnInit {
  public readonly viewEntryId$ = (this.route.params as Observable<{
    id: string;
  }>).pipe(
    pluck('id'),
    map(stringToNumber)
  );
  public readonly viewEntryLoadable$ = this.viewEntryId$.pipe(
    switchMap(viewEntryId => (viewEntryId == null
      ? of(Loadable.loaded(undefined))
      : this.logsService.selectWebApiLogEntryById(viewEntryId)
    )),
    cacheUntil(this.destroyed$)
  );
  public readonly viewEntry$ = selectLoadedValue(this.viewEntryLoadable$).pipe(
    cacheUntil(this.destroyed$)
  );

  public readonly loading$ = combineLatest([
    selectInitialLoading(this.viewEntryLoadable$),
    this.viewEntry$.pipe(startWith(undefined)).pipe(map(isNull))
  ]).pipe(map(someTrue));

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService,
    private readonly logsService: LogsService,
    private readonly destroyed$: Destroyed$
  ) { }

  public async ngOnInit() {
    this.pageTitleService.set('View Server Log Entry');
    this.viewEntry$.pipe(
      filter(isNotNull),
      takeUntil(this.destroyed$)
    ).subscribe(viewEntry => {
      this.pageTitleService.set(`View Server Log Entry - ${viewEntry.id}`);
    });

    const viewEntry = await firstValueFrom(this.viewEntry$);
    if (viewEntry == null) {
      await this.router.navigate(['..'], {relativeTo: this.route});
    }
  }
}
