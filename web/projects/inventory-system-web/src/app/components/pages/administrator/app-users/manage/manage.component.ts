import {Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {takeUntil} from 'rxjs/operators';

import {selectLoadedValue, selectLoading} from '../../../../../utils/loading';
import {stringRecordKeys} from '../../../../../utils/record';

import {PageTitleService} from '../../../../../services/page-title.service';
import {AppUsersService} from '../../../../../services/app-users.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

import {OtherAppUser} from '../../../../../models/app-user';
import {appRoleSortCompare, appRoleRankingByName} from '../../../../../models/app-role';

type ManageAppUsersForm = FormGroup<{
  filter: FormControl<string, {}>;
}, {}>;

@Component({
  selector: 'inventory-system-manage-app-users',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class ManageAppUsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) private sort!: MatSort;
  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  public readonly loading$ = selectLoading(this.appUsersService.appUsers$);
  public readonly appUsers$ = selectLoadedValue(this.appUsersService.appUsers$);

  public readonly form: ManageAppUsersForm = this.formBuilder.group({
    filter: this.formBuilder.control('')
  });

  public readonly dataSource = new MatTableDataSource<OtherAppUser>();
  public readonly columns: ReadonlyArray<keyof OtherAppUser> = [
    'id',
    'email',
    'name',
    'emailConfirmed',
    'lockedOut',
    'hasAppRoleByName'
  ];

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly appUsersService: AppUsersService,
    private readonly destroyed$: Destroyed$
  ) {
    this.dataSource.sortingDataAccessor = (appUser, sortHeaderId) => {
      const prop = sortHeaderId as keyof OtherAppUser;
      if (prop === 'hasAppRoleByName') {
        const totalWeightedRanking = (stringRecordKeys(appUser.hasAppRoleByName)
          .map(appRole => Math.pow(2, appRoleRankingByName[appRole]))
          .reduce((a, c) => a + c, 0)
        );
        return totalWeightedRanking;
      }

      if (
        prop === 'emailConfirmed'
        || prop === 'hasPassword'
        || prop === 'lockedOut'
      ) {
        return appUser[prop] ? 1 : 0;
      }

      return appUser[prop];
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
    this.pageTitleService.set('Manage Users');

    this.appUsers$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(appUsers => this.dataSource.data = appUsers);

    this.form.select(({filter}) => filter).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(filter => this.dataSource.filter = filter);
  }

  public ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public stringifyAppRoles(appUser: OtherAppUser) {
    return (stringRecordKeys(appUser.hasAppRoleByName)
      .sort(appRoleSortCompare)
      .reverse()
      .join(', ')
    );
  }
}
