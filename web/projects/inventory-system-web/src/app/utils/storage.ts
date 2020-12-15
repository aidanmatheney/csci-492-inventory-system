import {Observable} from 'rxjs';
import {startWith, tap} from 'rxjs/operators';

export const startFromAndCacheToLocalStorage = <V, C>(
  key: string,
  cacheValue: (value: V) => C,
  createInitialValue: (cachedValue: C | undefined) => V
) => {
  return (source: Observable<V>) => source.pipe(
    startWith(((): V => {
      const cachedValueString = localStorage.getItem(key);
      const cachedValue = cachedValueString == null ? undefined : JSON.parse(cachedValueString) as C;
      const initialValue = createInitialValue(cachedValue);
      return initialValue;
    })()),
    tap(value => {
      const cachedValue = cacheValue(value);
      const cachedValueString = JSON.stringify(cachedValue);
      localStorage.setItem(key, cachedValueString);
    })
  );
};
