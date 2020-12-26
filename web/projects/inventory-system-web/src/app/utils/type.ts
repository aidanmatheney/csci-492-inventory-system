export type SubType<T, S extends T> = S;

export const typed = <T>(value: T) => value;

interface NominalTypeMarker<S extends symbol> {
  readonly __nominalType__: S | undefined;
}
export type Nominal<T, S extends symbol> = T & NominalTypeMarker<S>;

export const nominalValue = <T, S extends symbol>(value: T, nominalTypeSymbol: S) => value as Nominal<T, S>;
