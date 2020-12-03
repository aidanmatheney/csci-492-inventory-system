import {Observable, TeardownLogic} from 'rxjs';
import {filter, first, mapTo, shareReplay, startWith, takeUntil, tap} from 'rxjs/operators';

export const firstValueFrom = <V>(value$: Observable<V>) => {
  return new Promise<V>((resolve, reject) => {
    value$.pipe(first()).subscribe(resolve, reject);
  });
};

export const startWithVoid = <T>() => startWith<T, void>(undefined);
export const mapToVoid = <T>() => mapTo<T, void>(undefined);

export const filterNotNull = <T>() => filter((value: T): value is NonNullable<T> => value != null);

export const tapLog = <V>(
  category: string,
  location: 'log' | 'warn' | 'error' = 'error'
) => tap((value: V) => console[location](`${category}:`, value));

export const cacheUntil = <T>(destroy$: Observable<void>) => {
  return (source: Observable<T>) => source.pipe(
    takeUntil(destroy$), // Unsubscribe from source
    shareReplay(1),
    takeUntil(destroy$) // Unsubscribe from replay
  );
};

export const imperative$ = <V>(
  run: (next: (value: V) => void) => TeardownLogic
) => {
  return new Observable<V>(subscriber => {
    return run(value => subscriber.next(value));
  });
};
