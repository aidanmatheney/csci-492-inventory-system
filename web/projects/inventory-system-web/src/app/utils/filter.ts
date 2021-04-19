export const is = <A>(...allowedValues: A[]) => {
  return <V>(value: V | A): value is A => {
    for (const allowedValue of allowedValues) {
      if (Object.is(value, allowedValue)) {
        return true;
      }
    }

    return false;
  };
};

export const isNot = <D>(...disallowedValues: D[]) => {
  return <V>(value: V | D): value is V => {
    for (const disallowedValue of disallowedValues) {
      if (Object.is(value, disallowedValue)) {
        return false;
      }
    }

    return true;
  };
};

export const isTrue = is(true as const);
export const isNotTrue = isNot(true as const);

export const isFalse = is(false as const);
export const isNotFalse = isNot(false as const);

export const isNull = is(null, undefined);
export const isNotNull = isNot(null, undefined);
