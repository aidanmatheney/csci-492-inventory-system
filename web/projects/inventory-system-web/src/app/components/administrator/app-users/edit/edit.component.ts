import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Validators} from '@angular/forms';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {Clipboard as ClipboardService} from '@angular/cdk/clipboard';
import {MatSnackBar as MatSnackBarService} from '@angular/material/snack-bar';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {map, pluck, startWith, switchMap, takeUntil} from 'rxjs/operators';

import {cacheUntil, filterNotNull, firstValueFrom} from '../../../../utils/observable';
import {selectInitialLoading, selectLoadedValue} from "../../../../utils/loading";
import {AngularFormErrors, FormValue, selectFormDirty, selectFormValid} from '../../../../utils/form';
import {ProcessingState} from '../../../../utils/processing';

import {DialogService} from '../../../../services/dialog.service';
import {CurrentAppUserService} from '../../../../services/current-app-user.service';
import {AppUsersService} from '../../../../services/app-users.service';
import {Destroyed$} from '../../../../services/destroyed$.service';

import {AppRole} from '../../../../models/app-role';
import {SaveablePage} from '../../../../guards/unsaved-changes.guard';

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
export class EditAppUserComponent implements OnInit, SaveablePage {
  public readonly editAppUserId$ = (this.route.params as Observable<{
    id: string;
  }>).pipe(pluck('id'));

  public readonly editAppUser$ = this.editAppUserId$.pipe(
    switchMap(editAppUserId => selectLoadedValue(this.appUsersService.selectAppUserById(editAppUserId)))
  );
  public readonly loading$ = combineLatest([
    selectInitialLoading(this.appUsersService.appUsers$),
    this.editAppUser$.pipe(startWith(undefined))
  ]).pipe(map(([appUsersLoading, editAppUser]) => appUsersLoading || editAppUser == null));
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
  public readonly formDirty$ = selectFormDirty(this.form, this.initialFormValue$).pipe(cacheUntil(this.destroyed$));
  public readonly formValid$ = selectFormValid(this.form);

  public readonly dirty$ = this.editAppUser$.pipe(
    switchMap(editAppUser => editAppUser == null ? of(false) : this.formDirty$)
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
    private readonly dialogService: DialogService,
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
      this.resetForm(editAppUserId, initialFormValue, editingCurrentAppUser);
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
      this.saveState$.next(ProcessingState.failed(String(error)));
    }
  }

  public async delete() {
    const editAppUser = (await firstValueFrom(this.editAppUser$))!;

    const confirmed = await this.dialogService.confirm({
      title: 'Confirm User Deletion',
      body: `Are you sure you wish to delete ${editAppUser.email}? This action is not reversable.`,
      requireInputToConfirm: editAppUser.email,
      confirmButton: {text: 'Delete', color: 'warn'}
    });
    if (!confirmed) {
      return;
    }

    this.deleteState$.next(ProcessingState.started);

    try {
      await this.appUsersService.delete(editAppUser.id);
      await this.router.navigate(['../..'], {relativeTo: this.route});
      this.deleteState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.deleteState$.next(ProcessingState.failed(String(error)));
    }
  }

  public async resendEmailConfirmation() {
    const editAppUser = (await firstValueFrom(this.editAppUser$))!;

    const confirmed = await this.dialogService.confirm({
      title: 'Confirm Resending Email Confirmation',
      body: `Are you sure you wish to resend an email confirmation to ${editAppUser.email}?`,
      confirmButton: {text: 'Resend'}
    });
    if (!confirmed) {
      return;
    }

    this.resendEmailConfirmationState$.next(ProcessingState.started);

    try {
      await this.appUsersService.resendEmailConfirmation(editAppUser.id);

      this.matSnackBarService.open(
        `Resent email confirmation to ${editAppUser.email}`,
        undefined,
        {duration: 5000}
      );

      this.resendEmailConfirmationState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.resendEmailConfirmationState$.next(ProcessingState.failed(String(error)));
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
    const editAppUser = (await firstValueFrom(this.editAppUser$))!;

    const confirmed = await this.dialogService.confirm({
      title: 'Confirm Password Removal',
      body: `Are you sure you wish to remove ${editAppUser.email}'s password?`,
      confirmButton: {text: 'Remove', color: 'warn'}
    });
    if (!confirmed) {
      return;
    }

    this.removePasswordState$.next(ProcessingState.started);

    try {
      await this.appUsersService.removePassword(editAppUser.id);

      this.matSnackBarService.open(
        `Removed ${editAppUser.email}'s password`,
        undefined,
        {duration: 5000}
      );

      this.removePasswordState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.removePasswordState$.next(ProcessingState.failed(String(error)));
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
