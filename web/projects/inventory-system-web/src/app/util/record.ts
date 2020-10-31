export type PartialRecord<K extends keyof any, V> = Partial<Record<K, V>>;

export const record = <K extends keyof any, V>() => {
  return Object.create(null) as Record<K, V>;
};

export const partialRecord = <K extends keyof any, V>() => {
  return Object.create(null) as PartialRecord<K, V>;
};

export const getOrAdd = <K extends string | number | symbol, V>(
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

export const getOrCreate = <K extends string | number | symbol, V>(
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
