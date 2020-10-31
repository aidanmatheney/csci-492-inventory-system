import {PartialRecord, partialRecord} from './record';

export const array = (length: number) => {
  return Array.from<void>({length});
};

export const range = (start: number, count: number) => {
  return array(count).map((_, index) => index + start);
};

export const indexArray = <T>(array: readonly T[]) => {
  return array.map((value, index) => [value, index] as const);
};

interface GroupBy {
  <S, K extends keyof any>(
    source: S[],
    keySelector: (element: S) => K
  ): PartialRecord<K, S[]>;

  <S, K extends keyof any, V>(
    source: S[],
    keySelector: (element: S) => K,
    valueSelector: (element: S) => V
  ): PartialRecord<K, V[]>;
}
export const groupBy: GroupBy = <S, K extends keyof any, V>(
  source: S[],
  keySelector: (element: S) => K,
  valueSelector?: (element: S) => V
) => {
  if (valueSelector == null) {
    const groupByKey = partialRecord<K, S[]>();
    for (const element of source) {
      const key = keySelector(element);
      const value = element;

      let group: S[];
      if (key in groupByKey) {
        group = groupByKey[key]!;
      } else {
        group = [];
        groupByKey[key] = group;
      }

      group.push(value);
    }

    return groupByKey;
  } else {
    const groupByKey = partialRecord<K, V[]>();
    for (const element of source) {
      const key = keySelector(element);
      const value = valueSelector(element);

      let group: V[];
      if (key in groupByKey) {
        group = groupByKey[key]!;
      } else {
        group = [];
        groupByKey[key] = group;
      }

      group.push(value);
    }

    return groupByKey;
  }
};

interface RecordBy {
  <S, K extends keyof any>(
    source: S[],
    keySelector: (element: S) => K
  ): PartialRecord<K, S>;

  <S, K extends keyof any, V>(
    source: S[],
    keySelector: (element: S) => K,
    valueSelector: (element: S) => V
  ): PartialRecord<K, V>;
}
export const recordBy: RecordBy = <S, K extends keyof any, V>(
  source: S[],
  keySelector: (element: S) => K,
  valueSelector?: (element: S) => V
) => {
  if (valueSelector == null) {
    const valueByKey = partialRecord<K, S>();
    for (const element of source) {
      const key = keySelector(element);
      const value = element;

      valueByKey[key] = value;
    }

    return valueByKey;
  } else {
    const valueByKey = partialRecord<K, V>();
    for (const element of source) {
      const key = keySelector(element);
      const value = valueSelector(element);

      valueByKey[key] = value;
    }

    return valueByKey;
  }
};
