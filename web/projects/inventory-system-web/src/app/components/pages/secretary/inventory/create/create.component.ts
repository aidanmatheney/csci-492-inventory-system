import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Validators} from '@angular/forms';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {BehaviorSubject, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

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
import {firstLoadedValueFrom, selectLoadedValue, selectLoading} from '../../../../../utils/loading';

import {PageTitleService} from '../../../../../services/page-title.service';
import {InventoryService} from '../../../../../services/inventory.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

import {SaveablePage} from '../../../../../guards/unsaved-page-changes.guard';

type CreateInventoryItemForm = FormGroup<{
  barcode: FormControl<string, AngularAndCustomFormErrors<'required', 'exists'>>;
  name: FormControl<string, AngularFormErrors<'required'>>;
  category: FormControl<string, {}>;
  cost: FormControl<number | null, {}>;
  building: FormControl<string, {}>;
  floor: FormControl<string, {}>;
  room: FormControl<string, {}>;
  acquiredDate: FormControl<Date | null, {}>;
  surplussedDate: FormControl<Date | null, {}>;
}, {}>;
type CreateInventoryItemFormValue = FormValue<CreateInventoryItemForm>;

@Component({
  selector: 'inventory-system-create-inventory-item',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class CreateInventoryItemComponent implements OnInit, SaveablePage {
  public readonly loading$ = selectLoading(this.inventoryService.itemHistories$);

  public readonly form: CreateInventoryItemForm = this.formBuilder.group({
    barcode: this.formBuilder.control('', {
      validators: [Validators.required],
      asyncValidators: [fixValidatorType(this.validateBarcodeNotTaken.bind(this))]
    }),
    name: this.formBuilder.control('', {
      validators: [Validators.required]
    }),
    category: this.formBuilder.control(''),
    cost: this.formBuilder.control(null as number | null),
    building: this.formBuilder.control(''),
    floor: this.formBuilder.control(''),
    room: this.formBuilder.control(''),
    acquiredDate: this.formBuilder.control(null as Date | null),
    surplussedDate: this.formBuilder.control(null as Date | null)
  });
  public readonly initialFormValue: CreateInventoryItemFormValue = {
    barcode: '',
    name: '',
    category: '',
    cost: null,
    building: '',
    floor: '',
    room: '',
    acquiredDate: null,
    surplussedDate: null
  };
  public readonly formDirty$ = selectFormDirty(this.form, of(this.initialFormValue)).pipe(cacheUntil(this.destroyed$));
  public readonly formValid$ = selectFormValid(this.form);

  public readonly dirty$ = this.formDirty$;

  // TODO: Allow creation if the existing item is deleted
  public readonly itemWithInputtedBarcode$ = this.form.select(({barcode}) => barcode).pipe(
    switchMap(barcode => selectLoadedValue(this.inventoryService.selectItemHistoryByBarcode(barcode)))
  );

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
    this.pageTitleService.set('Create Inventory Item');

    confirmUnsavedChangesBeforeUnload(this.dirty$);
  }

  public async create() {
    this.createState$.next(ProcessingState.started);

    const {
      barcode,
      name,
      category,
      cost,
      building,
      floor,
      room,
      acquiredDate,
      surplussedDate
    } = this.form.value;

    try {
      const {newItemId} = await this.inventoryService.createItem({
        barcode,
        name,
        category,
        cost: cost ?? undefined,
        building,
        floor,
        room,
        acquiredDate: acquiredDate ?? undefined,
        surplussedDate: surplussedDate ?? undefined
      });
      this.form.setValue(this.initialFormValue);
      await this.router.navigate(['..', newItemId], {relativeTo: this.route});
      this.createState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.createState$.next(ProcessingState.failed(String(error)));
    }
  }

  private async validateBarcodeNotTaken(
    barcodeFormControl: CreateInventoryItemForm['controls']['barcode']
  ): Promise<CreateInventoryItemForm['controls']['barcode']['errors'] | null> {
    const barcode = barcodeFormControl.value;

    const existingItemHistory = await firstLoadedValueFrom(this.inventoryService.selectItemHistoryByBarcode(barcode));
    if (existingItemHistory != null) {
      return {exists: true};
    }

    return null;
  }
}
