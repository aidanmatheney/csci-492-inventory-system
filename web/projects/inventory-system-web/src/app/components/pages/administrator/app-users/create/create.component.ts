import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Validators} from '@angular/forms';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {BehaviorSubject, of} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';

import {firstLoadedValueFrom, selectLoadedValue, selectLoading, selectLoadingBegan} from '../../../../../utils/loading';
import {
  AngularAndCustomFormErrors,
  AngularFormErrors,
  fixValidatorType,
  FormValue,
  selectFormDirty,
  selectFormValid
} from '../../../../../utils/form';
import {ProcessingState} from '../../../../../utils/processing';
import {cacheUntil} from '../../../../../utils/observable';
import {confirmUnsavedChangesBeforeUnload} from '../../../../../utils/confirm';

import {PageTitleService} from '../../../../../services/page-title.service';
import {AppUsersService} from '../../../../../services/app-users.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

import {AppRole} from '../../../../../models/app-role';
import {SaveablePage} from '../../../../../guards/unsaved-page-changes.guard';

type CreateAppUserForm = FormGroup<{
  email: FormControl<string, AngularAndCustomFormErrors<'required' | 'email', 'taken'>>;
  name: FormControl<string, AngularFormErrors<'required' | 'pattern'>>;
  isSecretary: FormControl<boolean, {}>;
  isAdministrator: FormControl<boolean, {}>;
}, {}>;
type CreateAppUserFormValue = FormValue<CreateAppUserForm>;

@Component({
  selector: 'inventory-system-create-app-user',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class CreateAppUserComponent implements OnInit, SaveablePage {
  public readonly loading$ = selectLoading(this.appUsersService.appUsers$);

  public readonly form: CreateAppUserForm = this.formBuilder.group({
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [fixValidatorType(this.validateEmailNotTaken.bind(this))]
    }),
    name: this.formBuilder.control('', {
      validators: [Validators.required, Validators.pattern(/^(?=\S).+(?<=\S)$/)]
    }),
    isSecretary: this.formBuilder.control(true),
    isAdministrator: this.formBuilder.control(false)
  });
  public readonly initialFormValue: CreateAppUserFormValue = {
    email: '',
    name: '',
    isSecretary: true,
    isAdministrator: false
  };
  public readonly formDirty$ = selectFormDirty(this.form, of(this.initialFormValue)).pipe(cacheUntil(this.destroyed$));
  public readonly formValid$ = selectFormValid(this.form);

  public readonly dirty$ = this.formDirty$.pipe(cacheUntil(this.destroyed$));

  public readonly appUserWithInputtedEmail$ = this.form.select(({email}) => email).pipe(
    switchMap(email => selectLoadedValue(this.appUsersService.selectAppUserByEmail(email)))
  );

  public readonly createState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly appUsersService: AppUsersService,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Create User');

    confirmUnsavedChangesBeforeUnload(this.dirty$);

    selectLoadingBegan(this.appUsersService.appUsers$).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(() => this.form.controls.email.updateValueAndValidity());
  }

  public async create() {
    this.createState$.next(ProcessingState.started);

    const {
      email,
      name,
      isSecretary,
      isAdministrator
    } = this.form.value;

    try {
      const {newAppUserId} = await this.appUsersService.create({
        email,
        name,
        appRoles: [
          isSecretary && AppRole.secretary,
          isAdministrator && AppRole.administrator
        ].filter((appRole): appRole is AppRole => appRole !== false)
      });
      this.form.setValue(this.initialFormValue);
      await this.router.navigate(['..', newAppUserId, 'created'], {relativeTo: this.route});
      this.createState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.createState$.next(ProcessingState.failed(String(error)));
    }
  }

  private async validateEmailNotTaken(
    emailFormControl: CreateAppUserForm['controls']['email']
  ): Promise<CreateAppUserForm['controls']['email']['errors'] | null> {
    const email = emailFormControl.value;

    const existingAppUser = await firstLoadedValueFrom(this.appUsersService.selectAppUserByEmail(email));
    if (existingAppUser != null) {
      return {taken: true};
    }

    return null;
  }
}
