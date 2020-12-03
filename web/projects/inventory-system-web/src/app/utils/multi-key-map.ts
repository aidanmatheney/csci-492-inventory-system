import {getOrCreate, partialRecord, recordValues} from './record';
import {nominalValue} from './type';

type RawKey = string;

class MultiKeyMapNode<K, V> {
  private _hasValue = false;
  private _keys?: K;
  private _value?: V;
  private readonly _children = partialRecord<RawKey, MultiKeyMapNode<K, V>>();

  public get hasValue() {
    return this._hasValue;
  }

  public get optionalKeys() {
    return this._keys;
  }

  public get optionalValue() {
    return this._value;
  }

  public get keys() {
    if (!this._hasValue) {
      throw new Error('No value present for keys');
    }

    return this._keys as K;
  }

  public get value() {
    if (!this._hasValue) {
      throw new Error('No value present for keys');
    }

    return this._value as V;
  }

  public setValue(keys: K, value: V) {
    this._hasValue = true;
    this._keys = keys;
    this._value = value;
  }

  public getOrAddValue(keys: K, defaultValue: V) {
    if (this._hasValue) {
      return this._value as V;
    }

    this.setValue(keys, defaultValue);
    return defaultValue;
  }

  public getOrCreateValue(keys: K, createDefaultValue: (keys: K) => V) {
    if (this._hasValue) {
      return this._value as V;
    }

    const defaultValue = createDefaultValue(keys);
    this.setValue(keys, defaultValue);
    return defaultValue;
  }

  public clearValue() {
    if (!this._hasValue) {
      return;
    }

    this._hasValue = false;
    this._keys = undefined;
    this._value = undefined;
  }

  public getOrCreateChild(rawKey: RawKey) {
    return getOrCreate(this._children, rawKey, () => new MultiKeyMapNode<K, V>());
  }

  public forEachChild(callback: (childNode: MultiKeyMapNode<K, V>) => void) {
    for (const childNode of recordValues(this._children)) {
      callback(childNode);
      childNode.forEachChild(callback);
    }
  }

  public clearChildren() {
    for (const rawKey in this._children) {
      delete this._children[rawKey];
    }
  }

  public clear() {
    this.clearValue();
    this.clearChildren();
  }
}

const NativeKeyVariadicSeparator = Symbol();
export const nativeKeyVariadicSeparator = nominalValue(
  'MultiKeyMapNativeKeyVariadicSeparator-35d326a7f3e14fffa8f4bf65c621af56',
  NativeKeyVariadicSeparator
);

export type NativeKey = (
  | string | number | bigint | boolean | null | undefined
  | Date
  | typeof nativeKeyVariadicSeparator
);
export type GetNativeKeys<K> = (keys: K) => NativeKey[];

export type MultiKeyMapConstructorArgs<K, V> = (
  K extends NativeKey[] ? [
    getNativeKeys?: GetNativeKeys<K>
  ] : [
    getNativeKeys: GetNativeKeys<K>
  ]
);
export class MultiKeyMap<K, V> {
  private readonly _rootNode = new MultiKeyMapNode<K, V>();
  private readonly _getNativeKeys?: GetNativeKeys<K>;

  public constructor(...[
    getNativeKeys
  ]: MultiKeyMapConstructorArgs<K, V>) {
    this._getNativeKeys = getNativeKeys;
  }

  public has(keys: K) {
    const valueNode = this.getOrCreateValueNode(keys);
    return valueNode.hasValue;
  }

  public tryGet(keys: K) {
    const valueNode = this.getOrCreateValueNode(keys);
    return valueNode.optionalValue;
  }

  public get(keys: K) {
    const valueNode = this.getOrCreateValueNode(keys);
    return valueNode.value;
  }

  public getOrAdd(keys: K, defaultValue: V) {
    const valueNode = this.getOrCreateValueNode(keys);
    return valueNode.getOrAddValue(keys, defaultValue);
  }

  public getOrCreate(keys: K, createDefaultValue: (keys: K) => V) {
    const valueNode = this.getOrCreateValueNode(keys);
    return valueNode.getOrCreateValue(keys, createDefaultValue);
  }

  public set(keys: K, value: V) {
    const valueNode = this.getOrCreateValueNode(keys);
    valueNode.setValue(keys, value);
  }

  public delete(keys: K) {
    const valueNode = this.getOrCreateValueNode(keys);
    return valueNode.clearValue();
  }

  public forEach(callback: (keys: K, value: V) => void) {
    if (this._rootNode.hasValue) {
      callback(this._rootNode.keys, this._rootNode.value);
    }

    this._rootNode.forEachChild(childNode => {
      if (childNode.hasValue) {
        callback(childNode.keys, childNode.value);
      }
    });
  }

  public entries() {
    const entries: (readonly [K, V])[] = [];
    this.forEach((keys, value) => entries.push([keys, value]));
    return entries;
  }

  public keysPerValue() {
    const keysPerValue: K[] = [];
    this.forEach((keys, _) => keysPerValue.push(keys));
    return keysPerValue;
  }

  public values() {
    const values: V[] = [];
    this.forEach((_, value) => values.push(value));
    return values;
  }

  public clear() {
    this._rootNode.clear();
  }

  private getRawKeys(keys: K) {
    const nativeKeys = this._getNativeKeys == null
      ? keys as unknown as NativeKey[] // getNativeKeys is only optional if K extends NativeKey[]
      : this._getNativeKeys(keys);

    const rawKeys = nativeKeys.map((nativeKey): RawKey => {
      if (nativeKey instanceof Date) {
        return nativeKey.toISOString();
      }

      // (typeof nativeKey === 'string')
      // || (typeof nativeKey === 'number')
      // || (typeof nativeKey === 'bigint')
      // || (typeof nativeKey === 'boolean')
      // || (nativeKey == null)
      return String(nativeKey);
    });
    return rawKeys;
  }

  private getOrCreateValueNode(keys: K) {
    const rawKeys = this.getRawKeys(keys);

    const valueNode = rawKeys.reduce(
      (node, rawKey) => node.getOrCreateChild(rawKey),
      this._rootNode
    );
    return valueNode;
  }
}
