export type ValueOf<T> = T[keyof T];
export type ElementOf<T extends readonly any[]> = T[keyof T & number];

export type WithNonNullableProperties<T, K extends keyof T> = T & {
  [X in K]-?: NonNullable<T[X]>;
};

export type SubType<T, S extends T> = S;

export const VOID: void = undefined;

export const typed = <T>(value: T) => value;

interface NominalTypeMarker<S extends symbol> {
  readonly __nominalType__: S | undefined;
}
export type Nominal<T, S extends symbol> = T & NominalTypeMarker<S>;

export const nominalValue = <T, S extends symbol>(value: T, nominalTypeSymbol: S) => value as Nominal<T, S>;
