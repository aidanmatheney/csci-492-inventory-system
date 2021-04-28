export type PartialRecord<K extends keyof any, V> = Partial<Record<K, V>>;

export const record = <K extends keyof any, V>() => {
  return Object.create(null) as Record<K, V>;
};
export const partialRecord = <K extends keyof any, V>() => {
  return Object.create(null) as PartialRecord<K, V>;
};

export type RecordSet<K extends keyof any> = Record<K, true>;
export type PartialRecordSet<K extends keyof any> = PartialRecord<K, true>;

export const recordSet = <K extends keyof any>() => record<K, true>();
export const partialRecordSet = <K extends keyof any>() => partialRecord<K, true>();

export const getOrAdd = <K extends keyof any, V>(
  source: PartialRecord<K, V>,
  key: K,
  defaultValue: V
) => {
  if (key in source) {
    return source[key] as V;
  }

  source[key] = defaultValue;
  return defaultValue;
};

export const getOrCreate = <K extends keyof any, V>(
  source: PartialRecord<K, V>,
  key: K,
  createValue: (key: K) => V
) => {
  if (key in source) {
    return source[key] as V;
  }

  const value = createValue(key);
  source[key] = value;
  return value;
};

export const stringRecordKeys = <K extends string, V>(source: Record<K, V> | PartialRecord<K, V>) => {
  return Object.keys(source) as K[];
};
export const stringRecordEntries = <K extends string, V>(source: Record<K, V> | PartialRecord<K, V>) => {
  return Object.entries(source) as Array<[K, V]>;
};

export const numberRecordKeys = <K extends number, V>(source: Record<K, V> | PartialRecord<K, V>) => {
  return Object.keys(source).map(Number) as K[];
};
export const numberRecordEntries = <K extends number, V>(source: Record<K, V> | PartialRecord<K, V>) => {
  return Object.entries(source).map(([keyString, value]) => [Number(keyString), value] as [K, V]);
};

export const recordValues = <K extends keyof any, V>(source: Record<K, V> | PartialRecord<K, V>) => {
  return Object.values(source) as V[];
};
