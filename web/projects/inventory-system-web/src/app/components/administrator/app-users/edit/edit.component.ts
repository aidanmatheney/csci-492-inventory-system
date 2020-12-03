import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Validators} from '@angular/forms';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {Clipboard as ClipboardService} from '@angular/cdk/clipboard';
import {MatSnackBar as MatSnackBarService} from '@angular/material/snack-bar';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map, pluck, switchMap, takeUntil} from 'rxjs/operators';

import {filterNotNull, firstValueFrom} from '../../../../utils/observable';
import {selectLoadedValue, selectLoading} from "../../../../utils/loading";
import {AngularFormErrors, FormValue} from '../../../../utils/form';
import {ProcessingState} from '../../../../utils/processing';

import {CurrentAppUserService} from '../../../../services/current-app-user.service';
import {AppUsersService} from '../../../../services/app-users.service';
import {Destroyed$} from '../../../../services/destroyed$.service';

import {AppRole} from '../../../../models/app-user';

type EditAppUserForm = FormGroup<{
  name: FormControl<string, AngularFormErrors<'required' | 'pattern'>>;
  lockedOut: FormControl<boolean, {}>;
  isSecretary: FormControl<boolean, {}>;
  isAdministrator: FormControl<boolean, {}>;
}, {}>;
type EditAppUserFormValue = FormValue<EditAppUserForm>;

@Component({
  selector: 'inventory-system-edit-app-user',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default, // OnPush prevents cdkTextareaAutosize's initial resize
  providers: [Destroyed$]
})
export class EditAppUserComponent implements OnInit {
  public readonly editAppUserId$ = (this.route.params as Observable<{
    id: string;
  }>).pipe(pluck('id'));

  public readonly loading$ = selectLoading(this.appUsersService.appUsers$);
  public readonly editAppUser$ = this.editAppUserId$.pipe(
    switchMap(editAppUserId => selectLoadedValue(this.appUsersService.selectAppUserById(editAppUserId)))
  );
  public readonly editingCurrentAppUser$ = combineLatest([
    this.editAppUser$,
    this.currentAppUserService.signedInAppUser$
  ]).pipe(
    map(([editAppUser, signedInAppUser]) => editAppUser?.id === signedInAppUser.id)
  );
  public readonly editAppUserEmailConfirmationUrl$ = this.editAppUserId$.pipe(
    switchMap(editAppUserId => this.appUsersService.selectSessionAppUserEmailConfirmationUrlById(editAppUserId))
  );

  public readonly form: EditAppUserForm = this.formBuilder.group({
    name: this.formBuilder.control('', {
      validators: [Validators.required, Validators.pattern(/^(?=\S).+(?<=\S)$/)]
    }),
    lockedOut: this.formBuilder.control(false),
    isSecretary: this.formBuilder.control(false),
    isAdministrator: this.formBuilder.control(false)
  });
  private formEditAppUserId?: string;
  public readonly initialFormValue$ = this.editAppUser$.pipe(
    filterNotNull(),
    map(({name, lockedOut, hasAppRoleByName}): EditAppUserFormValue => ({
      name,
      lockedOut,
      isSecretary: hasAppRoleByName[AppRole.secretary] ?? false,
      isAdministrator: hasAppRoleByName[AppRole.administrator] ?? false
    }))
  );

  public readonly saveState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);
  public readonly deleteState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);
  public readonly resendEmailConfirmationState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);
  public readonly removePasswordState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly clipboardService: ClipboardService,
    private readonly matSnackBarService: MatSnackBarService,
    private readonly currentAppUserService: CurrentAppUserService,
    private readonly appUsersService: AppUsersService,
    private readonly destroyed$: Destroyed$
  ) { }

  public async ngOnInit() {
    combineLatest([
      this.editAppUserId$,
      this.initialFormValue$,
      this.editingCurrentAppUser$
    ]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(([editAppUserId, initialFormValue, editingCurrentAppUser]) => {
      this.resetForm(editAppUserId, initialFormValue, editingCurrentAppUser)
    });

    const editAppUser = await firstValueFrom(this.editAppUser$);
    if (editAppUser == null) {
      await this.router.navigate(['../..'], {relativeTo: this.route});
    }
  }

  public async save() {
    this.saveState$.next(ProcessingState.started);

    const editAppUserId = await firstValueFrom(this.editAppUserId$);
    const {
      name,
      lockedOut,
      isSecretary,
      isAdministrator
    } = this.form.getRawValue();

    try {
      await this.appUsersService.update({
        appUserId: editAppUserId,
        name,
        lockedOut,
        appRoles: [
          isSecretary && AppRole.secretary,
          isAdministrator && AppRole.administrator
        ].filter((appRole): appRole is AppRole => appRole !== false)
      });
      this.saveState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.saveState$.next(ProcessingState.errored(String(error)));
    }
  }

  public async delete() {
    this.deleteState$.next(ProcessingState.started);

    const editAppUserId = await firstValueFrom(this.editAppUserId$);

    try {
      await this.appUsersService.delete(editAppUserId);
      await this.router.navigate(['../..'], {relativeTo: this.route});
      this.deleteState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.deleteState$.next(ProcessingState.errored(String(error)));
    }
  }

  public async resendEmailConfirmation() {
    this.resendEmailConfirmationState$.next(ProcessingState.started);

    const editAppUser = (await firstValueFrom(this.editAppUser$))!;

    try {
      await this.appUsersService.resendEmailConfirmation(editAppUser.id);

      this.matSnackBarService.open(
        `Resent email confirmation to ${editAppUser.email}`,
        undefined,
        {duration: 5000}
      );

      this.resendEmailConfirmationState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.resendEmailConfirmationState$.next(ProcessingState.errored(String(error)));
    }
  }

  public async copyEmailConfirmationUrl() {
    const editAppUserEmailConfirmationUrl = (await firstValueFrom(this.editAppUserEmailConfirmationUrl$))!;
    const success = this.clipboardService.copy(editAppUserEmailConfirmationUrl);
    this.matSnackBarService.open(
      `${success ? 'Copied' : 'Failed to copy'} email confirmation URL`,
      undefined,
      {duration: 2500}
    );
  }

  public async removePassword() {
    this.removePasswordState$.next(ProcessingState.started);

    const editAppUser = (await firstValueFrom(this.editAppUser$))!;

    try {
      await this.appUsersService.removePassword(editAppUser.id);

      this.matSnackBarService.open(
        `Removed ${editAppUser.email}'s password`,
        undefined,
        {duration: 5000}
      );

      this.removePasswordState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.removePasswordState$.next(ProcessingState.errored(String(error)));
    }
  }

  private resetForm(editAppUserId: string, initialFormValue: EditAppUserFormValue, editingCurrentAppUser: boolean) {
    if (this.formEditAppUserId !== editAppUserId) {
      this.form.setValue(initialFormValue);
      this.formEditAppUserId = editAppUserId;
    }

    this.form.controls.lockedOut.setDisable(editingCurrentAppUser);
    this.form.controls.isAdministrator.setDisable(editingCurrentAppUser);
  }
}
