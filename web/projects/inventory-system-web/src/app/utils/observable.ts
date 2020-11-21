import {Observable, TeardownLogic} from 'rxjs';
import {filter, first, map, pluck, shareReplay, takeUntil} from 'rxjs/operators';

import {getNextValueMutable} from './immutable';

export const firstValueFrom = <V>(value$: Observable<V>) => {
  return new Promise<V>((resolve, reject) => {
    value$.pipe(first()).subscribe(resolve, reject);
  });
};

export const cacheUntil = <T>(destroy$: Observable<void>) => {
  return (source: Observable<T>) => source.pipe(
    takeUntil(destroy$), // Unsubscribe from source
    shareReplay(1),
    takeUntil(destroy$) // Unsubscribe from replay
  );
};

type WithLoadingState<T> = (
  | ({loading: true;} & Partial<T>)
  | ({loading: false;} & T)
);

export const loadingValue$ = <V>(
  run: (
    next: (nextValueOrRecipe: WithLoadingState<V> | ((value: WithLoadingState<V>) => void)) => void
  ) => TeardownLogic
) => {
  return new Observable<WithLoadingState<V>>(valueSubscriber => {
    let value: WithLoadingState<V> = {loading: true};
    valueSubscriber.next(value);

    return run(nextValueOrRecipe => {
      const nextValue = getNextValueMutable(value, nextValueOrRecipe);
      if (
        (value.loading && nextValue.loading)
        || Object.is(value, nextValue)
      ) {
        return;
      }

      value = nextValue;
      valueSubscriber.next(value);
    });
  });
};

type Loaded<T extends {loading: boolean;}> = T & {loading: false;};

export const filterLoaded = <T extends {loading: boolean;}>() => {
  return filter((value: T): value is Loaded<T> => !value.loading);
};

export const filterMapLoaded = <
  TOriginal extends {loading: boolean;},
  TMapped
>(
  mapLoadedValue: (loadedValue: Loaded<TOriginal>) => TMapped
) => {
  return (source: Observable<TOriginal>) => source.pipe(
    filterLoaded(),
    map(mapLoadedValue)
  );
};

export const filterPluckLoaded = <
  TOriginal extends {loading: boolean;},
  TPropertyName extends keyof Loaded<TOriginal>
>(
  propertyName: TPropertyName
) => {
  return (source: Observable<TOriginal>) => source.pipe(
    filterLoaded(),
    pluck(propertyName)
  );
};
