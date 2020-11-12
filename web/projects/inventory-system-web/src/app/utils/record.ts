export type PartialRecord<K extends keyof any, V> = Partial<Record<K, V>>;

export type RecordSet<K extends keyof any> = Record<K, true>;
export type PartialRecordSet<K extends keyof any> = PartialRecord<K, true>;

export const record = <K extends keyof any, V>() => {
  return Object.create(null) as Record<K, V>;
};
export const partialRecord = <K extends keyof any, V>() => {
  return Object.create(null) as PartialRecord<K, V>;
};

export const getOrAdd = <K extends keyof any, V>(
  source: PartialRecord<K, V>,
  key: K,
  defaultValue: V
) => {
  if (key in source) {
    return source[key];
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
    return source[key];
  }

  const value = createValue(key);
  source[key] = value;
  return value;
};
