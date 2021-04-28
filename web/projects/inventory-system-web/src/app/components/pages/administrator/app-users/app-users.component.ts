import {Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChildren, QueryList} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {takeUntil} from 'rxjs/operators';

import {selectLoadedValue, selectLoading} from '../../../../utils/loading';
import {stringRecordKeys} from '../../../../utils/record';
import {wireUpTable} from '../../../../utils/table';
import {ElementOf} from '../../../../utils/type';

import {PageTitleService} from '../../../../services/page-title.service';
import {AppUsersService} from '../../../../services/app-users.service';
import {Destroyed$} from '../../../../services/destroyed$.service';

import {OtherAppUser} from '../../../../models/app-user';
import {appRoleSortCompare, appRoleRankingByName} from '../../../../models/app-role';

type AppUsersForm = FormGroup<{
  filter: FormControl<string, {}>;
}, {}>;

@Component({
  selector: 'inventory-system-app-users',
  templateUrl: './app-users.component.html',
  styleUrls: ['./app-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class AppUsersComponent implements OnInit, AfterViewInit {
  // Use ViewChildren since these are inside an ngIf
  @ViewChildren(MatSort) private sort!: QueryList<MatSort>;
  @ViewChildren(MatPaginator) private paginator!: QueryList<MatPaginator>;

  public readonly appUsers$ = selectLoadedValue(this.appUsersService.appUsers$);
  public readonly loading$ = selectLoading(this.appUsersService.appUsers$);

  public readonly form: AppUsersForm = this.formBuilder.group({
    filter: this.formBuilder.control('')
  });

  public readonly dataSource = new MatTableDataSource<OtherAppUser>();
  public readonly columns = [
    'id',
    'email',
    'name',
    'emailConfirmed',
    'lockedOut',
    'roles'
  ] as const;

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly appUsersService: AppUsersService,
    private readonly destroyed$: Destroyed$
  ) {
    this.dataSource.sortingDataAccessor = (appUser, sortHeaderId) => {
      const column = sortHeaderId as ElementOf<AppUsersComponent['columns']>;

      if (column === 'roles') {
        const totalWeightedRanking = (stringRecordKeys(appUser.hasAppRoleByName)
          .map(appRole => Math.pow(2, appRoleRankingByName[appRole]))
          .reduce((a, c) => a + c, 0)
        );
        return totalWeightedRanking;
      }

      if (
        column === 'emailConfirmed'
        || column === 'lockedOut'
      ) {
        return appUser[column] ? 1 : 0;
      }

      return appUser[column];
    };

    this.dataSource.filterPredicate = (appUser, filter) => {
      const lowercaseFields = [
        appUser.id,
        appUser.email,
        appUser.name,
        ...stringRecordKeys(appUser.hasAppRoleByName)
      ].map(field => field.toLowerCase());

      const lowercaseFilter = filter.toLowerCase();

      return lowercaseFields.some(field => field.includes(lowercaseFilter));
    };
  }

  public ngOnInit() {
    this.pageTitleService.set('Users');

    this.appUsers$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(appUsers => this.dataSource.data = appUsers);

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

  public stringifyAppRoles(appUser: OtherAppUser) {
    return (stringRecordKeys(appUser.hasAppRoleByName)
      .sort(appRoleSortCompare)
      .reverse()
      .join(', ')
    );
  }
}
