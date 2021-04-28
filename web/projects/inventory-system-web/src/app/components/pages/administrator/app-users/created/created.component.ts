import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Clipboard as ClipboardService} from '@angular/cdk/clipboard';
import {MatSnackBar as MatSnackBarService} from '@angular/material/snack-bar';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, pluck, startWith, switchMap, takeUntil} from 'rxjs/operators';

import {firstValueFrom} from '../../../../../utils/observable';
import {selectLoadedValue, selectLoading} from '../../../../../utils/loading';
import {isNotNull, isNull, someTrue} from '../../../../../utils/filter';

import {PageTitleService} from '../../../../../services/page-title.service';
import {AppUsersService} from '../../../../../services/app-users.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

@Component({
  selector: 'inventory-system-app-user-created',
  templateUrl: './created.component.html',
  styleUrls: ['./created.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default, // OnPush prevents cdkTextareaAutosize's initial resize
  providers: [Destroyed$]
})
export class AppUserCreatedComponent implements OnInit {
  public readonly createdAppUserId$ = (this.route.params as Observable<{
    id: string;
  }>).pipe(pluck('id'));
  public readonly createdAppUser$ = this.createdAppUserId$.pipe(
    switchMap(createdAppUserId => selectLoadedValue(this.appUsersService.selectAppUserById(createdAppUserId)))
  );
  public readonly createdAppUserEmailConfirmationUrl$ = this.createdAppUserId$.pipe(
    switchMap(createdAppUserId => this.appUsersService.selectSessionAppUserEmailConfirmationUrlById(createdAppUserId))
  );

  public readonly loading$ = combineLatest([
    selectLoading(this.appUsersService.appUsers$),
    this.createdAppUser$.pipe(startWith(undefined), map(isNull)),
    this.createdAppUserEmailConfirmationUrl$.pipe(map(isNull))
  ]).pipe(map(someTrue));

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly clipboardService: ClipboardService,
    private readonly matSnackBarService: MatSnackBarService,
    private readonly pageTitleService: PageTitleService,
    private readonly appUsersService: AppUsersService,
    private readonly destroyed$: Destroyed$
  ) { }

  public async ngOnInit() {
    this.pageTitleService.set('User Created');
    this.createdAppUser$.pipe(
      filter(isNotNull),
      takeUntil(this.destroyed$)
    ).subscribe(createdAppUser => this.pageTitleService.set(`User Created - ${createdAppUser.email}`));

    const [
      createdAppUser,
      createdAppUserEmailConfirmationUrl
    ] = await firstValueFrom(combineLatest([
      this.createdAppUser$,
      this.createdAppUserEmailConfirmationUrl$
    ]));
    if (createdAppUser == null) {
      await this.router.navigate(['../..'], {relativeTo: this.route});
      return;
    }
    if (createdAppUserEmailConfirmationUrl == null) {
      await this.router.navigate(['../edit'], {relativeTo: this.route});
    }
  }

  public async copyCreatedAppUserEmailConfirmationUrl() {
    const createdAppUserEmailConfirmationUrl = (await firstValueFrom(this.createdAppUserEmailConfirmationUrl$))!;
    const success = this.clipboardService.copy(createdAppUserEmailConfirmationUrl);
    this.matSnackBarService.open(
      `${success ? 'Copied' : 'Failed to copy'} email confirmation URL`,
      undefined,
      {duration: 2500}
    );
  }
}
