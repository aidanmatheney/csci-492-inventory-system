import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Validators} from '@angular/forms';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {filter, map, pluck, startWith, switchMap, takeUntil} from 'rxjs/operators';

import {
  AngularFormErrors,
  FormValue,
  selectFormDirty,
  selectFormValid
} from '../../../../../utils/form';
import {cacheUntil, firstValueFrom} from '../../../../../utils/observable';
import {selectInitialLoading, selectLoadedValue} from '../../../../../utils/loading';
import {ProcessingState} from '../../../../../utils/processing';
import {confirmUnsavedChangesBeforeUnload} from '../../../../../utils/confirm';
import {isFalse, isNotNull} from '../../../../../utils/filter';
import {stringToNumber} from '../../../../../utils/number';

import {PageTitleService} from '../../../../../services/page-title.service';
import {DialogService} from '../../../../../services/dialog.service';
import {InventoryService} from '../../../../../services/inventory.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

import {SaveablePage} from '../../../../../guards/unsaved-page-changes.guard';

type EditInventoryItemForm = FormGroup<{
  name: FormControl<string, AngularFormErrors<'required'>>;
  category: FormControl<string, {}>;
  cost: FormControl<number | null, {}>;
  building: FormControl<string, {}>;
  floor: FormControl<string, {}>;
  room: FormControl<string, {}>;
  acquiredDate: FormControl<Date | null, {}>;
  surplussedDate: FormControl<Date | null, {}>;
  flagged: FormControl<boolean, {}>;
  flaggedReason: FormControl<string, {}>;
}, {}>;
type EditInventoryItemFormValue = FormValue<EditInventoryItemForm>;

@Component({
  selector: 'inventory-system-edit-inventory-item',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class EditInventoryItemComponent implements OnInit, SaveablePage {
  public readonly editItemId$ = (this.route.params as Observable<{
    id: string;
  }>).pipe(
    pluck('id'),
    map(stringToNumber)
  );

  public readonly editItemHistory$ = this.editItemId$.pipe(
    switchMap(editItemId => (editItemId == null
      ? of(undefined)
      : selectLoadedValue(this.inventoryService.selectItemHistoryById(editItemId))
    )),
    cacheUntil(this.destroyed$)
  );
  public readonly loading$ = combineLatest([
    selectInitialLoading(this.inventoryService.itemHistories$),
    this.editItemHistory$.pipe(startWith(undefined))
  ]).pipe(map(([itemHistoriesLoading, editItemHistory]) => itemHistoriesLoading || editItemHistory == null));

  public readonly form: EditInventoryItemForm = this.formBuilder.group({
    name: this.formBuilder.control('', {
      validators: [Validators.required]
    }),
    category: this.formBuilder.control(''),
    cost: this.formBuilder.control(null as number | null),
    building: this.formBuilder.control(''),
    floor: this.formBuilder.control(''),
    room: this.formBuilder.control(''),
    acquiredDate: this.formBuilder.control(null as Date | null),
    surplussedDate: this.formBuilder.control(null as Date | null),
    flagged: this.formBuilder.control(false),
    flaggedReason: this.formBuilder.control('')
  });
  private formEditItemId?: number;
  public readonly initialFormValue$ = this.editItemHistory$.pipe(
    filter(isNotNull),
    map(({lastUndeletedSnapshot: {
      name,
      category,
      cost,
      building,
      floor,
      room,
      acquiredDate,
      surplussedDate,
      flaggedReason
    }}): EditInventoryItemFormValue => ({
      name,
      category: category ?? '',
      cost: cost ?? null,
      building: building ?? '',
      floor: floor ?? '',
      room: room ?? '',
      acquiredDate: acquiredDate ?? null,
      surplussedDate: surplussedDate ?? null,
      flagged: flaggedReason != null,
      flaggedReason: flaggedReason ?? ''
    }))
  );
  public readonly formDirty$ = selectFormDirty(this.form, this.initialFormValue$).pipe(cacheUntil(this.destroyed$));
  public readonly formValid$ = selectFormValid(this.form);

  public readonly dirty$ = this.editItemHistory$.pipe(
    switchMap(editItemHistory => editItemHistory == null ? of(false) : this.formDirty$)
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
    this.pageTitleService.set('Edit Inventory Item');
    this.editItemHistory$.pipe(
      filter(isNotNull),
      takeUntil(this.destroyed$)
    ).subscribe(editItemHistory => {
      this.pageTitleService.set(`Edit Inventory Item - ${editItemHistory.lastUndeletedSnapshot.name}`);
    });

    confirmUnsavedChangesBeforeUnload(this.dirty$);

    combineLatest([
      this.editItemId$.pipe(filter(isNotNull)),
      this.initialFormValue$
    ]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(([editItemId, initialFormValue]) => this.resetForm(editItemId, initialFormValue));

    this.form.select(({flagged}) => flagged).pipe(
      filter(isFalse),
      takeUntil(this.destroyed$)
    ).subscribe(() => this.clearFlaggedReason());

    const editItemHistory = await firstValueFrom(this.editItemHistory$);
    if (editItemHistory == null || editItemHistory.currentSnapshot == null) {
      await this.router.navigate(['../..'], {relativeTo: this.route});
    }
  }

  public async save() {
    this.saveState$.next(ProcessingState.started);

    const editItemId = (await firstValueFrom(this.editItemId$))!;
    const {
      name,
      category,
      cost,
      building,
      floor,
      room,
      acquiredDate,
      surplussedDate,
      flagged,
      flaggedReason
    } = this.form.getRawValue();

    try {
      await this.inventoryService.updateItem({
        itemId: editItemId,
        name,
        category,
        cost: cost ?? undefined,
        building,
        floor,
        room,
        acquiredDate: acquiredDate ?? undefined,
        surplussedDate: surplussedDate ?? undefined,
        flaggedReason: flagged ? flaggedReason : undefined
      });
      this.saveState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.saveState$.next(ProcessingState.failed(String(error)));
    }
  }

  public async delete() {
    const editItemHistory = (await firstValueFrom(this.editItemHistory$))!;

    const confirmed = await this.dialogService.confirm({
      title: 'Confirm Inventory Item Deletion',
      body: `Are you sure you wish to delete ${editItemHistory.lastUndeletedSnapshot.name}?`,
      confirmButton: {text: 'Delete', color: 'warn'}
    });
    if (!confirmed) {
      return;
    }

    this.deleteState$.next(ProcessingState.started);

    try {
      await this.inventoryService.deleteItem(editItemHistory.item.id);
      await this.router.navigate(['../..'], {relativeTo: this.route});
      this.deleteState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.deleteState$.next(ProcessingState.failed(String(error)));
    }
  }

  private resetForm(editItemId: number, initialFormValue: EditInventoryItemFormValue) {
    if (this.formEditItemId !== editItemId) {
      this.form.setValue(initialFormValue);
      this.formEditItemId = editItemId;
    }
  }

  private clearFlaggedReason() {
    this.form.patchValue({flaggedReason: ''});
  }
}
