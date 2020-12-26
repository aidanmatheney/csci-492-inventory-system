import {concat, defer, Observable} from 'rxjs';
import {first, tap} from 'rxjs/operators';

export const startFromAndSaveToLocalStorage = <V, C>(
  key: string,
  cacheValue: (value: V) => C,
  createInitialValue: (cachedValue: C | undefined) => Observable<V>
) => {
  return (source: Observable<V>) => concat(
    defer(() => {
      const cachedValueString = localStorage.getItem(key);
      const cachedValue = cachedValueString == null ? undefined : JSON.parse(cachedValueString) as C;
      const initialValue$ = createInitialValue(cachedValue);
      return initialValue$
    }).pipe(first()),
    source
  ).pipe(
    tap(value => {
      const cachedValue = cacheValue(value);
      const cachedValueString = JSON.stringify(cachedValue);
      localStorage.setItem(key, cachedValueString);
    })
  );
};
