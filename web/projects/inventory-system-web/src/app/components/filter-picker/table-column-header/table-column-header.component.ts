import {Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild, Input, ComponentRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {FormBuilder} from '@ngneat/reactive-forms';
import {Overlay as OverlayService, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {BehaviorSubject, combineLatest, EMPTY, merge, Observable, ReplaySubject, Subject} from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  pluck,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import {format as formatDate} from 'date-fns';

import {hasNonNullableProperties, isNotNull, isNull, isTrue} from '../../../utils/filter';
import {cacheUntil, firstValueFrom, selectEmittedThisInstant} from '../../../utils/observable';
import {selectFormValid} from '../../../utils/form';
import {deepEquals} from '../../../utils/compare';

import {Destroyed$} from '../../../services/destroyed$.service';

import {FilterPickerTableColumnHeaderOverlayComponent} from './overlay/overlay.component';
import {
  ArgumentsByFilterNameAndDataType,
  DataTypeByFilterName,
  FilterName,
  FormValueByFilterName,
  FormValueByFilterNameAndDataType
} from '../model'

@Component({
  selector: 'inventory-system-filter-picker-table-column-header[columnTitle][filter][dataType]',
  templateUrl: './table-column-header.component.html',
  styleUrls: ['./table-column-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FilterPickerTableColumnHeaderComponent
    },
    Destroyed$
  ]
})
export class FilterPickerTableColumnHeaderComponent<
  TFilterName extends FilterName,
  TDataType extends DataTypeByFilterName<TFilterName>
> implements OnInit, ControlValueAccessor {
  private readonly buttonElementRef$ = new BehaviorSubject<ElementRef<HTMLButtonElement> | undefined>(undefined);
  @ViewChild('button') public set buttonElementRef(value: ElementRef<HTMLButtonElement>) {
    this.buttonElementRef$.next(value);
  }

  @Input() public columnTitle!: string;

  public readonly filter$ = new BehaviorSubject<TFilterName>(undefined!);
  public get filter() { return this.filter$.value; }
  @Input() public set filter(value: TFilterName) { this.filter$.next(value); }

  private readonly dataType$ = new BehaviorSubject<TDataType>(undefined!);
  public get dataType() { return this.dataType$.value; }
  @Input() public set dataType(value: TDataType) { this.dataType$.next(value); }

  public readonly args$ = new BehaviorSubject<ArgumentsByFilterNameAndDataType<TFilterName, TDataType>>(undefined!);
  public get args() { return this.args$.value; }
  @Input() public set args(value: ArgumentsByFilterNameAndDataType<TFilterName, TDataType>) { this.args$.next(value); }

  private readonly overlayRef$ = this.buttonElementRef$.pipe(
    filter(isNotNull),
    switchMap(buttonElementRef => new Observable<OverlayRef>(subscriber => {
      const overlayRef = this.overlayService.create({
        positionStrategy: this.overlayService.position()
          .flexibleConnectedTo(buttonElementRef)
          .withPositions([{originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'top', offsetY: 15}]),
        hasBackdrop: true
      });
      subscriber.next(overlayRef);
      return () => overlayRef.dispose();
    })),
    cacheUntil(this.destroyed$)
  );
  private readonly backdropClicked$ = this.overlayRef$.pipe(
    switchMap(overlayRef => overlayRef.backdropClick())
  );

  private readonly overlayComponentPortal = new ComponentPortal<
    FilterPickerTableColumnHeaderOverlayComponent<TFilterName, TDataType>
  >(FilterPickerTableColumnHeaderOverlayComponent);
  private readonly lastAttachedOverlayComponentRef$ = (
    new ReplaySubject<ComponentRef<FilterPickerTableColumnHeaderOverlayComponent<TFilterName, TDataType>>>(1)
  );
  private readonly overlayComponent$ = this.lastAttachedOverlayComponentRef$.pipe(
    switchMap(overlayComponentRef => new Observable<
      FilterPickerTableColumnHeaderOverlayComponent<TFilterName, TDataType> | undefined
    >(subscriber => {
      subscriber.next(overlayComponentRef.instance);
      overlayComponentRef.onDestroy(() => subscriber.next(undefined));
    })),
    startWith(undefined),
    cacheUntil(this.destroyed$)
  );

  private readonly willWriteValue$ = new Subject<void>();
  private readonly writingValueThisInstant$ = selectEmittedThisInstant(this.willWriteValue$).pipe(
    cacheUntil(this.destroyed$)
  );
  private readonly lastWrittenValue$ = new ReplaySubject<FormValueByFilterNameAndDataType<TFilterName, TDataType>>(1);

  private readonly form = (
    this.formBuilder.control<FormValueByFilterNameAndDataType<TFilterName, TDataType>>(null!)
  );
  private readonly formValid$ = this.overlayComponent$.pipe(
    switchMap(overlayComponent => overlayComponent == null ? EMPTY : selectFormValid(this.form)),
    // The forms library removes directive-provided validation from form controls when the directive is destroyed
    // So ignore the last status if it occurs at the same instant as the overlay component being destroyed
    delay(0),
    startWith(true),
    distinctUntilChanged(),
    cacheUntil(this.destroyed$)
  );

  public readonly sourcedExternalFormValue$ = merge(
    this.lastWrittenValue$.pipe(
      map(lastWrittenValue => ({source: 'external' as const, formValue: lastWrittenValue}))
    ),
    this.form.value$.pipe(
      distinctUntilChanged(deepEquals),
      withLatestFrom(this.writingValueThisInstant$),
      filter(([, writingValueThisInstant]) => !writingValueThisInstant),
      map(([formValue]) => ({source: 'internal' as const, formValue}))
    ),
  ).pipe(
    switchMap(sourcedFormValue => this.overlayComponent$.pipe(
      filter(isNull),
      take(1),
      mapTo(sourcedFormValue)
    )),
    distinctUntilChanged((oldSourcedFormValue, newSourcedFormValue) => (
      deepEquals(oldSourcedFormValue.formValue, newSourcedFormValue.formValue)
      && newSourcedFormValue.source === 'internal'
    )),
    cacheUntil(this.destroyed$)
  );
  public readonly externalFormValue$ = this.sourcedExternalFormValue$.pipe(pluck('formValue'));

  public readonly filterText$ = this.externalFormValue$.pipe(
    map(formValue => {
      if (formValue == null) {
        return 'Filter...';
      }

      if (this.filter === 'contains' || this.filter === 'equalsOne') {
        const value = formValue as NonNullable<FormValueByFilterName<'contains'>>;
        return this.createValueDisplayText(value);
      }
      if (this.filter === 'equalsAny') {
        const values = formValue as NonNullable<FormValueByFilterName<'equalsAny'>>;
        return values.map(value => this.createValueDisplayText(value)).join(', ');
      }
      if (this.filter === 'min') {
        const min = formValue as NonNullable<FormValueByFilterName<'min'>>;
        return `${this.createValueDisplayText(min)}–`;
      }
      if (this.filter === 'max') {
        const max = formValue as NonNullable<FormValueByFilterName<'max'>>;
        return `–${this.createValueDisplayText(max)}`;
      }
      console.assert(this.filter === 'range');
      const {min, max} = formValue as NonNullable<FormValueByFilterName<'range'>>;
      return `${this.createValueDisplayText(min)}–${this.createValueDisplayText(max)}`;
    })
  );

  private externalFormOnTouched?: () => void;
  private externalFormOnChange?: (value: FormValueByFilterNameAndDataType<TFilterName, TDataType>) => void;

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly overlayService: OverlayService,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    this.backdropClicked$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(() => this.closePicker());

    combineLatest([this.overlayComponent$, this.filter$]).pipe(
      filter(hasNonNullableProperties(0)),
      takeUntil(this.destroyed$)
    ).subscribe(([overlayComponent, filter]) => overlayComponent.filter = filter);
    combineLatest([this.overlayComponent$, this.dataType$]).pipe(
      filter(hasNonNullableProperties(0)),
      takeUntil(this.destroyed$)
    ).subscribe(([overlayComponent, dataType]) => overlayComponent.dataType = dataType);
    combineLatest([this.overlayComponent$, this.args$]).pipe(
      filter(hasNonNullableProperties(0)),
      takeUntil(this.destroyed$)
    ).subscribe(([overlayComponent, args]) => overlayComponent.args = args);
    this.overlayComponent$.pipe(
      filter(isNotNull),
      takeUntil(this.destroyed$)
    ).subscribe(overlayComponent => overlayComponent.form = this.form);

    this.overlayComponent$.pipe(
      filter(isNotNull),
      switchMap(overlayComponent => overlayComponent.viewInitialized$.pipe(
        filter(isTrue),
        mapTo(overlayComponent)
      )),
      delay(0),
      takeUntil(this.destroyed$)
    ).subscribe(overlayComponent => overlayComponent.focusFirstInput());
    this.overlayComponent$.pipe(
      filter(isNotNull),
      switchMap(overlayComponent => overlayComponent.submit),
      takeUntil(this.destroyed$)
    ).subscribe(() => this.closePicker());

    this.sourcedExternalFormValue$.pipe(
      skip(1),
      filter(({source}) => source === 'internal'),
      pluck('formValue'),
      takeUntil(this.destroyed$)
    ).subscribe(externalFormValue => {
      this.externalFormOnTouched?.();
      this.externalFormOnChange?.(externalFormValue);
    });

    this.overlayComponent$.pipe(
      filter(isNull),
      withLatestFrom(this.formValid$),
      filter(([, formValid]) => !formValid),
      takeUntil(this.destroyed$)
    ).subscribe(() => this.form.setValue(null!));
  }

  public async openPicker() {
    const overlayRef = await firstValueFrom(this.overlayRef$);
    if (!overlayRef.hasAttached()) {
      const overlayComponentRef = overlayRef.attach(this.overlayComponentPortal);
      this.lastAttachedOverlayComponentRef$.next(overlayComponentRef);
    }
  }

  public async closePicker() {
    const overlayRef = await firstValueFrom(this.overlayRef$);
    if (overlayRef.hasAttached()) {
      overlayRef.detach();
    }
  }

  public async togglePicker() {
    const overlayRef = await firstValueFrom(this.overlayRef$);
    if (overlayRef.hasAttached()) {
      this.closePicker();
    } else {
      this.openPicker();
    }
  }

  public clear() {
    this.form.setValue(null!);
  }

  public writeValue(formValue: FormValueByFilterNameAndDataType<TFilterName, TDataType>) {
    this.willWriteValue$.next();
    this.form.setValue(formValue);
    this.lastWrittenValue$.next(formValue);
  }

  public registerOnTouched(onTouched: () => void) {
    this.externalFormOnTouched = onTouched;
  }

  public registerOnChange(onChange: (value: FormValueByFilterNameAndDataType<TFilterName, TDataType>) => void) {
    this.externalFormOnChange = onChange;
  }

  private createValueDisplayText(value: string | boolean | number | Date | null) {
    return (
      value == null ? ''
      : this.dataType === 'string' ? `\"${value as string}\"`
      : this.dataType === 'enum' ? value as string
      : this.dataType === 'bool' ? ((value as boolean) ? 'Yes' : 'No')
      : (this.dataType === 'int' || this.dataType === 'uint') ? String(value as number)
      : (this.dataType === 'float' || this.dataType === 'ufloat') ? (value as number).toFixed(2)
      : this.dataType === 'money' ? `$${(value as number).toFixed(2)}`
      : formatDate(value as Date, 'M/d/yy')
    );
  }
}
