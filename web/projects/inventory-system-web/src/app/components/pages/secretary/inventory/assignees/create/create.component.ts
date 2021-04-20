import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Validators} from '@angular/forms';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {BehaviorSubject, of} from 'rxjs';

import {AngularFormErrors, FormValue, selectFormDirty, selectFormValid} from '../../../../../../utils/form';
import {ProcessingState} from '../../../../../../utils/processing';
import {cacheUntil} from '../../../../../../utils/observable';
import {confirmUnsavedChangesBeforeUnload} from '../../../../../../utils/confirm';
import {selectLoading} from '../../../../../../utils/loading';

import {PageTitleService} from '../../../../../../services/page-title.service';
import {InventoryService} from '../../../../../../services/inventory.service';
import {Destroyed$} from '../../../../../../services/destroyed$.service';

import {SaveablePage} from '../../../../../../guards/unsaved-page-changes.guard';

type CreateInventoryAssigneeForm = FormGroup<{
  name: FormControl<string, AngularFormErrors<'required'>>;
  email: FormControl<string, AngularFormErrors<'required' | 'email'>>;
}, {}>;
type CreateInventoryAssigneeFormValue = FormValue<CreateInventoryAssigneeForm>;

@Component({
  selector: 'inventory-system-create-inventory-assignee',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class CreateInventoryAssigneeComponent implements OnInit, SaveablePage {
  public readonly loading$ = selectLoading(this.inventoryService.assigneeHistories$);

  public readonly form: CreateInventoryAssigneeForm = this.formBuilder.group({
    name: this.formBuilder.control('', {
      validators: [Validators.required]
    }),
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email]
    })
  });
  public readonly initialFormValue: CreateInventoryAssigneeFormValue = {
    name: '',
    email: ''
  };
  public readonly formDirty$ = selectFormDirty(this.form, of(this.initialFormValue)).pipe(cacheUntil(this.destroyed$));
  public readonly formValid$ = selectFormValid(this.form);

  public readonly dirty$ = this.formDirty$;

  public readonly createState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly inventoryService: InventoryService,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Create Inventory Assignee');

    confirmUnsavedChangesBeforeUnload(this.dirty$);
  }

  public async create() {
    this.createState$.next(ProcessingState.started);

    const {
      name,
      email
    } = this.form.value;

    try {
      const {newAssigneeId} = await this.inventoryService.createAssignee({
        name,
        email
      });
      this.form.setValue(this.initialFormValue);
      await this.router.navigate(['..', newAssigneeId], {relativeTo: this.route});
      this.createState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.createState$.next(ProcessingState.failed(String(error)));
    }
  }
}
