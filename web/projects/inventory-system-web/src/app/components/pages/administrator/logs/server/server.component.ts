import {Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChildren, QueryList} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {of, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

import {wireUpTable} from '../../../../../utils/table';
import {startFromAndSaveToLocalStorage} from '../../../../../utils/storage';
import {tapLog} from '../../../../../utils/debug';
import {DynamicQueryDataSource} from '../../../../../utils/dynamic-query';
import {FormValue, selectFormDirty} from '../../../../../utils/form';
import {cacheUntil} from '../../../../../utils/observable';
import {isNotFalse, isNotNull} from '../../../../../utils/filter';

import {PageTitleService} from '../../../../../services/page-title.service';
import {LogsService} from '../../../../../services/logs.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

import {WebApiLogEntry, WebApiLogLevel} from '../../../../../models/log';
import {DynamicQueryFilterOperator} from '../../../../../models/dynamic-query';
import {RangeFilterFormValue} from '../../../../filter-picker/model';

type ServerLogsForm = FormGroup<{
  filters: FormGroup<{
    id: FormControl<RangeFilterFormValue<number>, {}>;
    timeWritten: FormControl<RangeFilterFormValue<Date>, {}>;
    serverName: FormControl<string | null, {}>;
    category: FormControl<string | null, {}>;
    scope: FormControl<string | null, {}>;
    logLevel: FormControl<WebApiLogLevel | null, {}>;
    eventId: FormControl<number | null, {}>;
    eventName: FormControl<string | null, {}>;
    message: FormControl<string | null, {}>;
    exception: FormControl<string | null, {}>;
  }, {}>;
}, {}>;
type ServerLogsFormValue = FormValue<ServerLogsForm>;

@Component({
  selector: 'inventory-system-server-logs',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class ServerLogsComponent implements OnInit, AfterViewInit {
  // Use ViewChildren since these are inside an ngIf
  @ViewChildren(MatSort) private sort!: QueryList<MatSort>;
  @ViewChildren(MatPaginator) private paginator!: QueryList<MatPaginator>;

  public readonly form: ServerLogsForm = this.formBuilder.group({
    filters: this.formBuilder.group({
      id: this.formBuilder.control(null),
      timeWritten: this.formBuilder.control(null),
      serverName: this.formBuilder.control(null),
      category: this.formBuilder.control(null),
      scope: this.formBuilder.control(null),
      logLevel: this.formBuilder.control(WebApiLogLevel.warning),
      eventId: this.formBuilder.control(null),
      eventName: this.formBuilder.control(null),
      message: this.formBuilder.control(null),
      exception: this.formBuilder.control(null)
    })
  });
  public readonly initialFormValue: ServerLogsFormValue = {
    filters: {
      id: null,
      timeWritten: null,
      serverName: null,
      category: null,
      scope: null,
      logLevel: WebApiLogLevel.warning,
      eventId: null,
      eventName: null,
      message: null,
      exception: null,
    }
  };
  public readonly formDirty$ = selectFormDirty(this.form, of(this.initialFormValue)).pipe(cacheUntil(this.destroyed$));
  public readonly filterCount$ = this.form.select(({filters}) => filters).pipe(
    map(filters => Object.values(filters).filter(isNotNull).length)
  );

  public readonly dataSource = new DynamicQueryDataSource<WebApiLogEntry>(
    parameters => this.logsService.queryWebApiLogEntries(parameters),
    this.destroyed$
  );
  public readonly columns = [
    'id',

    'timeWritten',
    'serverName',

    'category',
    'scope',
    'logLevel',
    'eventId',
    'eventName',
    'message',
    'exception',
  ] as const;

  public readonly loading$ = this.dataSource.loading$;

  public readonly nextPageSize$ = new Subject<number>();
  public readonly pageSize$ = this.nextPageSize$.pipe(startFromAndSaveToLocalStorage(
    'serverLogsTablePageSize',
    pageSize => pageSize,
    pageSize => of(pageSize ?? 10)
  ));

  public readonly WebApiLogLevel = WebApiLogLevel;

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly logsService: LogsService,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Server Logs');

    this.form.select(({filters}) => filters).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(({
      id,
      timeWritten,
      serverName,
      category,
      scope,
      logLevel,
      eventId,
      eventName,
      message,
      exception
    }) => {
      this.dataSource.filters = [
        (id != null) && {
          field: 'id' as const,
          operator: DynamicQueryFilterOperator.range,
          arguments: [id.min ?? undefined, id.max ?? undefined]
        },
        (timeWritten != null) && {
          field: 'timeWritten' as const,
          operator: DynamicQueryFilterOperator.range,
          arguments: [timeWritten.min ?? undefined, timeWritten.max ?? undefined]
        },
        (serverName != null) && {
          field: 'serverName' as const,
          operator: DynamicQueryFilterOperator.containsAny,
          arguments: [serverName]
        },
        (category != null) && {
          field: 'category' as const,
          operator: DynamicQueryFilterOperator.containsAny,
          arguments: [category]
        },
        (scope != null) && {
          field: 'scope' as const,
          operator: DynamicQueryFilterOperator.containsAny,
          arguments: [scope]
        },
        (logLevel != null) && {
          field: 'logLevel' as const,
          operator: DynamicQueryFilterOperator.range,
          arguments: [logLevel, undefined]
        },
        (eventId != null) && {
          field: 'eventId' as const,
          operator: DynamicQueryFilterOperator.equalsAny,
          arguments: [eventId]
        },
        (eventName != null) && {
          field: 'eventName' as const,
          operator: DynamicQueryFilterOperator.containsAny,
          arguments: [eventName]
        },
        (message != null) && {
          field: 'message' as const,
          operator: DynamicQueryFilterOperator.containsAny,
          arguments: [message]
        },
        (exception != null) && {
          field: 'exception' as const,
          operator: DynamicQueryFilterOperator.containsAny,
          arguments: [exception]
        }
      ].filter(isNotFalse);
    });
  }

  public ngAfterViewInit() {
    wireUpTable({
      dataSource: this.dataSource,
      sort: this.sort,
      paginator: this.paginator
    });
  }

  public refresh() {
    this.dataSource.refresh();
  }
}
