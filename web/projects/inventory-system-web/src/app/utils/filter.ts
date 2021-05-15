import {WithNonNullableProperties} from './type';

export const is = <A>(...allowedValues: readonly A[]) => {
  const allowedValueSet = new Set(allowedValues);
  return <V>(value: V | A): value is A => (allowedValueSet as Set<V | A>).has(value);
};
export const isNot = <D>(...disallowedValues: readonly D[]) => {
  const disallowedValueSet = new Set(disallowedValues);
  return <V>(value: V | D): value is V => !(disallowedValueSet as Set<V | D>).has(value);
};

export const isTrue = is(true as const);
export const isNotTrue = isNot(true as const);

export const isFalse = is(false as const);
export const isNotFalse = isNot(false as const);

export const isNull = is(null, undefined);
export const isNotNull = isNot(null, undefined);

export const some = <A>(...allowedValues: readonly A[]) => {
  const allowedValueSet = new Set(allowedValues);
  return <V>(values: ReadonlyArray<V | A>): boolean => {
    for (const value of values) {
      if ((allowedValueSet as Set<V | A>).has(value)) {
        return true;
      }
    }

    return false;
  };
};
export const someNot = <D>(...disallowedValues: readonly D[]) => {
  const disallowedValueSet = new Set(disallowedValues);
  return <V>(values: ReadonlyArray<V | D>): boolean => {
    for (const value of values) {
      if (!(disallowedValueSet as Set<V | D>).has(value)) {
        return true;
      }
    }

    return false;
  };
};

export const someTrue = some(true as const);
export const someNotTrue = someNot(true as const);

export const someFalse = some(false as const);
export const someNotFalse = someNot(false as const);

export const someNull = some(null, undefined);
export const someNotNull = someNot(null, undefined);

export const hasNonNullableProperties = <T, K extends keyof T>(
  ...keys: readonly K[]
) => {
  return (obj: T): obj is WithNonNullableProperties<T, K> => {
    for (const key of keys) {
      if (obj[key] == null) {
        return false;
      }
    }

    return true;
  };
};
