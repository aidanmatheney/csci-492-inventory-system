import {GetNativeKeys, MultiKeyMap, MultiKeyMapConstructorArgs, NativeKey} from './multi-key-map';

export const memoize: {
  <K extends readonly NativeKey[], V>(
    createValue: (...keys: K) => V,
    getNativeKeys?: GetNativeKeys<K>
  ): (...keys: K) => V;

  <K extends readonly any[], V>(
    createValue: (...keys: K) => V,
    getNativeKeys: GetNativeKeys<K>
  ): (...keys: K) => V;
} = <K extends readonly any[], V>(
  createValue: (...keys: K) => V,
  getNativeKeys?: GetNativeKeys<K>
) => {
  const valueByKeys = new MultiKeyMap<K, V>(...([getNativeKeys] as unknown as MultiKeyMapConstructorArgs<K, V>));
  return (...keys: K) => valueByKeys.getOrCreate(keys, () => createValue(...keys));
};
