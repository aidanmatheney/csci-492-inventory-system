import {AbstractControl as NgAbstractControl} from '@angular/forms';
import {AbstractControl, FormArray, FormControl, FormGroup, NgValidatorsErrors} from '@ngneat/reactive-forms';
import {ControlsValue, ControlValue} from '@ngneat/reactive-forms/lib/types';
import {combineLatest, interval, Observable} from 'rxjs';
import {distinctUntilChanged, map, startWith, switchMap, take} from 'rxjs/operators';

import {deepEquals} from './compare';
import {PartialRecord} from './record';

export type FormValue<F> = ControlValue<F>;
export type FormControlsValue<C extends object> = ControlsValue<C>;

export type AngularFormErrors<
  TAngularErrorKeys extends keyof NgValidatorsErrors
> = Partial<Pick<NgValidatorsErrors, TAngularErrorKeys>>;
export type CustomFormErrors<
  TCustomErrorKeys extends string
> = PartialRecord<TCustomErrorKeys, true>;
export type AngularAndCustomFormErrors<
  TAngularErrorKeys extends keyof NgValidatorsErrors,
  TCustomErrorKeys extends string
> = AngularFormErrors<TAngularErrorKeys> & CustomFormErrors<TCustomErrorKeys>;

export const selectFormDirty = <C extends object, E extends object>(
  control: FormGroup<C, E>,
  initialValue$: Observable<FormControlsValue<C>>
) => {
  return combineLatest([
    control.value$,
    initialValue$
  ]).pipe(
    map(([value, initialValue]) => !deepEquals(value, initialValue)),
    distinctUntilChanged()
  );
};

export const selectFormStatus = (
  control: FormControl | FormArray | FormGroup
) => control.status$.pipe(
  switchMap(status => interval(0).pipe(
    take(1),
    // Fix mat-datepicker bug where the control will fire a statusChanged event for INVALID but 0ms later switch to
    // VALID without firing the event
    map(() => control.status),
    startWith(status)
  )),
  distinctUntilChanged()
);
export const selectFormValid = (
  control: FormControl | FormArray | FormGroup
) => selectFormStatus(control).pipe(map(status => status === 'VALID'));

export const fixValidatorType: {
  <T, E extends object>(
    validator: (control: FormControl<T, E>) => E | null
  ): (control: AbstractControl<T, E> | NgAbstractControl) => E | null;

  <T, E extends object>(
    validator: (control: FormArray<T, E>) => E | null
  ): (control: AbstractControl<T[], E> | NgAbstractControl) => E | null;

  <C extends object, E extends object>(
    validator: (control: FormGroup<C, E>) => E | null
  ): (control: AbstractControl<C, E> | NgAbstractControl) => E | null;


  <T, E extends object>(
    validator: (control: FormControl<T, E>) => Promise<E | null>
  ): (control: AbstractControl<T, E> | NgAbstractControl) => Promise<E | null>;

  <T, E extends object>(
    validator: (control: FormArray<T, E>) => Promise<E | null>
  ): (control: AbstractControl<T[], E> | NgAbstractControl) => Promise<E | null>;

  <C extends object, E extends object>(
    validator: (control: FormGroup<C, E>) => Promise<E | null>
  ): (control: AbstractControl<C, E> | NgAbstractControl) => Promise<E | null>;
} = (validator: any) => validator;
