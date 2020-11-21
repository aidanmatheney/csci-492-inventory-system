class Lazy<T> {
  private _initialized = false;
  private _value?: T;

  public constructor(
    private readonly _getValue: () => T
  ) { }

  public get value() {
    if (!this._initialized) {
      this._value = this._getValue();
      this._initialized = true;
    }

    return this._value as T;
  }
}
export const lazy = <T>(getValue: () => T) => new Lazy(getValue);


class AsyncLazy<T> {
  private _initialized = false;
  private _valuePromise?: Promise<T>;

  public constructor(
    private readonly _getValueAsync: () => Promise<T>
  ) { }

  public value() {
    if (!this._initialized) {
      this._valuePromise = this._getValueAsync();
      this._initialized = true;
    }

    return this._valuePromise as Promise<T>;
  }
}
export const asyncLazy = <T>(getValueAsync: () => Promise<T>) => new AsyncLazy(getValueAsync);
