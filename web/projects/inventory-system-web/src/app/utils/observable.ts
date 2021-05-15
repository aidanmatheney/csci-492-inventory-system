import {Observable, of, TeardownLogic} from 'rxjs';
import {delay, first, shareReplay, startWith, switchMap, takeUntil} from 'rxjs/operators';

export const firstValueFrom = <V>(value$: Observable<V>) => {
  return new Promise<V>((resolve, reject) => {
    value$.pipe(first()).subscribe(resolve, reject);
  });
};

export const selectEmittedThisInstant = <V>(value$: Observable<V>) => {
  return value$.pipe(
    switchMap(() => of(false).pipe(
      delay(0),
      startWith(true)
    )),
    startWith(false)
  );
};

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
