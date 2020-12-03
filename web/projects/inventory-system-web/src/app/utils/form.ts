import {AbstractControl, FormArray, FormControl, FormGroup, NgValidatorsErrors} from '@ngneat/reactive-forms';
import {ControlsValue, ControlValue} from '@ngneat/reactive-forms/lib/types';
import {combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';

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

export const selectFormValid = <C extends object, E extends object>(
  control: FormGroup<C, E>
) => control.status$.pipe(map(status => status === 'VALID'));

export const fixValidatorType: {
  <T, E extends object>(
    validator: (control: FormControl<T, E>) => E | null
  ): (control: AbstractControl<T>) => E | null;

  <T, E extends object>(
    validator: (control: FormArray<T, E>) => E | null
  ): (control: AbstractControl<T[]>) => E | null;

  <C extends object, E extends object>(
    validator: (control: FormGroup<C, E>) => E | null
  ): (control: AbstractControl<C>) => E | null;


  <T, E extends object>(
    validator: (control: FormControl<T, E>) => Promise<E | null>
  ): (control: AbstractControl<T>) => Promise<E | null>;

  <T, E extends object>(
    validator: (control: FormArray<T, E>) => Promise<E | null>
  ): (control: AbstractControl<T[]>) => Promise<E | null>;

  <C extends object, E extends object>(
    validator: (control: FormGroup<C, E>) => Promise<E | null>
  ): (control: AbstractControl<E>) => Promise<E | null>;
} = (validator: any) => validator;
