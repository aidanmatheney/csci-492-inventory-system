import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Validators} from '@angular/forms';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {filter, map, pluck, startWith, switchMap, takeUntil} from 'rxjs/operators';

import {AngularFormErrors, FormValue, selectFormDirty, selectFormValid} from '../../../../../../utils/form';
import {cacheUntil, firstValueFrom} from '../../../../../../utils/observable';
import {selectInitialLoading, selectLoadedValue} from '../../../../../../utils/loading';
import {ProcessingState} from '../../../../../../utils/processing';
import {confirmUnsavedChangesBeforeUnload} from '../../../../../../utils/confirm';
import {isNotNull} from '../../../../../../utils/filter';
import {stringToNumber} from '../../../../../../utils/number';

import {PageTitleService} from '../../../../../../services/page-title.service';
import {DialogService} from '../../../../../../services/dialog.service';
import {InventoryService} from '../../../../../../services/inventory.service';
import {Destroyed$} from '../../../../../../services/destroyed$.service';

import {SaveablePage} from '../../../../../../guards/unsaved-page-changes.guard';

type EditInventoryAssigneeForm = FormGroup<{
  name: FormControl<string, AngularFormErrors<'required'>>;
  email: FormControl<string, AngularFormErrors<'required' | 'email'>>;
}, {}>;
type EditInventoryAssigneeFormValue = FormValue<EditInventoryAssigneeForm>;

@Component({
  selector: 'inventory-system-edit-inventory-assignee',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class EditInventoryAssigneeComponent implements OnInit, SaveablePage {
  public readonly editAssigneeId$ = (this.route.params as Observable<{
    id: string;
  }>).pipe(
    pluck('id'),
    map(stringToNumber)
  );

  public readonly editAssigneeHistory$ = this.editAssigneeId$.pipe(
    switchMap(editAssigneeId => (editAssigneeId == null
      ? of(undefined)
      : selectLoadedValue(this.inventoryService.selectAssigneeHistoryById(editAssigneeId))
    )),
    cacheUntil(this.destroyed$)
  );
  public readonly loading$ = combineLatest([
    selectInitialLoading(this.inventoryService.assigneeHistories$),
    this.editAssigneeHistory$.pipe(startWith(undefined))
  ]).pipe(map(([assigneeHistoriesLoading, editAssigneeHistory]) => (
    assigneeHistoriesLoading
    || editAssigneeHistory == null
  )));

  public readonly form: EditInventoryAssigneeForm = this.formBuilder.group({
    name: this.formBuilder.control('', {
      validators: [Validators.required]
    }),
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email]
    })
  });
  private formEditAssigneeId?: number;
  public readonly initialFormValue$ = this.editAssigneeHistory$.pipe(
    filter(isNotNull),
    map(({lastUndeletedSnapshot: {
      name,
      email
    }}): EditInventoryAssigneeFormValue => ({
      name,
      email
    }))
  );
  public readonly formDirty$ = selectFormDirty(this.form, this.initialFormValue$).pipe(cacheUntil(this.destroyed$));
  public readonly formValid$ = selectFormValid(this.form);

  public readonly dirty$ = this.editAssigneeHistory$.pipe(
    switchMap(editAssigneeHistory => editAssigneeHistory == null ? of(false) : this.formDirty$)
  );

  public readonly saveState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);
  public readonly deleteState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly dialogService: DialogService,
    private readonly inventoryService: InventoryService,
    private readonly destroyed$: Destroyed$
  ) { }

  public async ngOnInit() {
    this.pageTitleService.set('Edit Inventory Assignee');
    this.editAssigneeHistory$.pipe(
      filter(isNotNull),
      takeUntil(this.destroyed$)
    ).subscribe(editAssigneeHistory => {
      this.pageTitleService.set(`Edit Inventory Assignee - ${editAssigneeHistory.lastUndeletedSnapshot.name}`);
    });

    confirmUnsavedChangesBeforeUnload(this.dirty$);

    combineLatest([
      this.editAssigneeId$.pipe(filter(isNotNull)),
      this.initialFormValue$
    ]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(([editAssigneeId, initialFormValue]) => this.resetForm(editAssigneeId, initialFormValue));

    const editAssigneeHistory = await firstValueFrom(this.editAssigneeHistory$);
    if (editAssigneeHistory == null || editAssigneeHistory.currentSnapshot == null) {
      await this.router.navigate(['../..'], {relativeTo: this.route});
    }
  }

  public async save() {
    this.saveState$.next(ProcessingState.started);

    const editAssigneeId = (await firstValueFrom(this.editAssigneeId$))!;
    const {
      name,
      email
    } = this.form.getRawValue();

    try {
      await this.inventoryService.updateAssignee({
        assigneeId: editAssigneeId,
        name,
        email
      });
      this.saveState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.saveState$.next(ProcessingState.failed(String(error)));
    }
  }

  public async delete() {
    const editAssigneeHistory = (await firstValueFrom(this.editAssigneeHistory$))!;

    const confirmed = await this.dialogService.confirm({
      title: 'Confirm Inventory Assignee Deletion',
      body: `Are you sure you wish to delete ${editAssigneeHistory.lastUndeletedSnapshot.name}?`,
      confirmButton: {text: 'Delete', color: 'warn'}
    });
    if (!confirmed) {
      return;
    }

    this.deleteState$.next(ProcessingState.started);

    try {
      await this.inventoryService.deleteAssignee(editAssigneeHistory.assignee.id);
      await this.router.navigate(['../..'], {relativeTo: this.route});
      this.deleteState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.deleteState$.next(ProcessingState.failed(String(error)));
    }
  }

  private resetForm(editAssigneeId: number, initialFormValue: EditInventoryAssigneeFormValue) {
    if (this.formEditAssigneeId !== editAssigneeId) {
      this.form.setValue(initialFormValue);
      this.formEditAssigneeId = editAssigneeId;
    }
  }
}
