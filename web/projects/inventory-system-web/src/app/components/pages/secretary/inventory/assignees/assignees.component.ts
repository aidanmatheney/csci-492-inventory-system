import {Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {of} from 'rxjs';
import {delay, startWith, takeUntil} from 'rxjs/operators';

import {PageTitleService} from '../../../../../services/page-title.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

interface Assignee {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'inventory-system-assignees',
  templateUrl: './assignees.component.html',
  styleUrls: ['./assignees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class AssigneesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) private sort!: MatSort;
  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  public readonly loading$ = of(false).pipe(delay(1000), startWith(true));
  public readonly assignees$ = of<Assignee[]>([
    {id: 'aaa', name: 'John Doe', email: 'john.doe@und.edu'},
    {id: 'aab', name: 'Jane Smith', email: 'jane.smith@und.edu'},
    {id: 'aac', name: 'Mike Johnson', email: 'mike.johnson@und.edu'}
  ]);

  public readonly dataSource = new MatTableDataSource<Assignee>();
  public readonly columns: ReadonlyArray<keyof Assignee> = [
    'id',
    'name',
    'email'
  ];

  public constructor(
    private readonly pageTitleService: PageTitleService,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Assignees');

    this.assignees$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(assignees => this.dataSource.data = assignees);
  }

  public ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
