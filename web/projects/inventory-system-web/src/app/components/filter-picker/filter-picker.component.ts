import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import {AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator} from '@angular/forms';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {MatSelect} from '@angular/material/select';
import {Subject} from 'rxjs';
import {distinctUntilChanged, filter, skip, takeUntil, withLatestFrom} from 'rxjs/operators';
import {endOfDay} from 'date-fns';

import {CustomFormErrors, fixValidatorType} from '../../utils/form';
import {cacheUntil, selectEmittedThisInstant} from '../../utils/observable';
import {deepEquals} from '../../utils/compare';

import {Destroyed$} from '../../services/destroyed$.service';

import {
  FilterName,
  DataTypeByFilterName,
  FormValueByFilterNameAndDataType,
  ArgumentsByFilterNameAndDataType,
  FormValueByFilterName
} from './model';

type FilterPickerForm = FormGroup<
  {
    value: FormControl<unknown, {}>;
    min: FormControl<unknown, {}>;
    max: FormControl<unknown, {}>;
  },
  CustomFormErrors<'maxBelowMin'>
>;

@Component({
  selector: 'inventory-system-filter-picker[filter][dataType]',
  templateUrl: './filter-picker.component.html',
  styleUrls: ['./filter-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FilterPickerComponent
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: FilterPickerComponent
    },
    Destroyed$
  ]
})
export class FilterPickerComponent<
  TFilterName extends FilterName,
  TDataType extends DataTypeByFilterName<TFilterName>
> implements OnInit, ControlValueAccessor, Validator {
  @ViewChildren('input') public inputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('matSelect') public selects!: QueryList<MatSelect>;

  @Input() public filter!: TFilterName;
  @Input() public dataType!: TDataType;
  @Input() public args!: ArgumentsByFilterNameAndDataType<TFilterName, TDataType>;

  @Output() public readonly submit = new EventEmitter<void>();

  public readonly form: FilterPickerForm = this.formBuilder.group(
    {
      value: this.formBuilder.control(null),
      min: this.formBuilder.control(null),
      max: this.formBuilder.control(null)
    },
    {validators: [fixValidatorType(this.validateMaxNotBelowMin.bind(this))]}
  );

  private externalFormOnTouched?: () => void;
  private externalFormOnChange?: (value: FormValueByFilterNameAndDataType<TFilterName, TDataType>) => void;

  private readonly willWriteValue$ = new Subject<void>();
  private readonly writingValueThisInstant$ = selectEmittedThisInstant(this.willWriteValue$).pipe(
    cacheUntil(this.destroyed$)
  );

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    this.form.value$.pipe(
      skip(1),
      distinctUntilChanged(deepEquals),
      withLatestFrom(this.writingValueThisInstant$),
      filter(([, writingValueThisInstant]) => !writingValueThisInstant),
      takeUntil(this.destroyed$)
    ).subscribe(([{value, min, max}]) => {
      let externalFormValue: FormValueByFilterNameAndDataType<TFilterName, TDataType>;
      if (this.filter === 'contains') {
        console.assert(this.dataType === 'string');
        externalFormValue = (
          (value == null || value === '') ? null
          : value
        ) as FormValueByFilterNameAndDataType<TFilterName, TDataType>;
      } else if (this.filter === 'equalsOne') {
        externalFormValue = value as FormValueByFilterNameAndDataType<TFilterName, TDataType>;
      } else if (this.filter === 'equalsAny') {
        console.assert(this.dataType === 'enum');
        externalFormValue = (
          (value == null || (value as string[]).length === 0) ? null
          : value
        ) as FormValueByFilterNameAndDataType<TFilterName, TDataType>;
      } else if (this.filter === 'min') {
        externalFormValue = min as FormValueByFilterNameAndDataType<TFilterName, TDataType>;
      } else if (this.filter === 'max') {
        externalFormValue = (
          max == null ? null
          : this.dataType === 'date' ? endOfDay(max as Date)
          : max
        ) as FormValueByFilterNameAndDataType<TFilterName, TDataType>;
      } else {
        console.assert(this.filter === 'range');
        externalFormValue = (
          (min == null && max == null) ? null
          : this.dataType === 'date' ? {min, max: max == null ? null : endOfDay(max as Date)}
          : {min, max}
        ) as FormValueByFilterNameAndDataType<TFilterName, TDataType>;
      }

      this.externalFormOnTouched?.();
      this.externalFormOnChange?.(externalFormValue);
    });
  }

  public focusFirstInput() {
    if (this.inputs.length > 0) {
      this.inputs.first.nativeElement.select();
    } else if (this.selects.length > 0) {
      this.selects.first.focus();
    } else {
      console.assert(false, 'Input type is not registered with focusFirstInput', {
        filter: this.filter,
        dataType: this.dataType,
        inputs: this.inputs,
        selects: this.selects
      });
    }
  }

  public writeValue(formValue: FormValueByFilterNameAndDataType<TFilterName, TDataType>) {
    this.willWriteValue$.next();

    if (this.filter === 'contains' || this.filter === 'equalsOne') {
      this.form.patchValue({value: formValue});
    } else if (this.filter === 'equalsAny') {
      const values = formValue as FormValueByFilterName<'equalsAny'>;
      this.form.patchValue({value: values ?? []});
    } else if (this.filter === 'min') {
      this.form.patchValue({min: formValue});
    } else if (this.filter === 'max') {
      this.form.patchValue({max: formValue});
    } else {
      console.assert(this.filter === 'range');
      const range = formValue as FormValueByFilterName<'range'>;
      this.form.patchValue({min: range?.min ?? null, max: range?.max ?? null});
    }
  }

  public registerOnTouched(onTouched: () => void) {
    this.externalFormOnTouched = onTouched;
  }

  public registerOnChange(onChange: (value: FormValueByFilterNameAndDataType<TFilterName, TDataType>) => void) {
    this.externalFormOnChange = onChange;
  }

  public validate(control: AbstractControl) {
    return this.form.errors;
  }

  private validateMaxNotBelowMin(form: FilterPickerForm): FilterPickerForm['errors'] | null {
    if (this.filter !== 'range') {
      return null;
    }

    const {min, max} = form.value;
    if (min == null || max == null) {
      return null;
    }

    if (this.dataType === 'enum') {
      throw new Error('validateMaxNotBelowMin not implemented for enums'); // TODO
    } else if (
      this.dataType === 'int'
      || this.dataType === 'uint'
      || this.dataType === 'float'
      || this.dataType === 'ufloat'
      || this.dataType === 'money'
    ) {
      return (
        (max as number) < (min as number) ? {maxBelowMin: true}
        : null
      );
    } else {
      console.assert(this.dataType === 'date');
      return (
        endOfDay(max as Date).getTime() < (min as Date).getTime() ? {maxBelowMin: true}
        : null
      );
    }
  }
}
