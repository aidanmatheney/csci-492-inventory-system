import {Observable, of, OperatorFunction} from 'rxjs';
import {distinctUntilChanged, endWith, filter, map, pluck, switchMap, takeWhile} from 'rxjs/operators';

import {firstValueFrom, mapToVoid} from './observable';

export interface Loading {
  loading: true;
}
export interface Loaded<V> {
  loading: false;
  value: V;
}
export type Loadable<V> = Loading | Loaded<V>;

export const Loadable: {
  loading: Loading;
  loaded<V>(value: V): Loaded<V>;

  isLoading<V>(loadable: Loadable<V>): loadable is Loading;
  isLoaded<V>(loadable: Loadable<V>): loadable is Loaded<V>;
} = {
  loading: {loading: true},
  loaded: value => ({loading: false, value}),

  isLoading: (loadable): loadable is Loading => loadable.loading,
  isLoaded: <V>(loadable: Loadable<V>): loadable is Loaded<V> => !loadable.loading
};

export const mapLoaded = <V, M>(
  project: (value: V) => M
) => {
  return map((loadable: Loadable<V>): Loadable<M> => {
    if (loadable.loading) {
      return Loadable.loading;
    }

    const mappedValue = project(loadable.value);
    return Loadable.loaded(mappedValue);
  });
};
export const pluckLoaded = <V, K extends keyof V>(
  key: K
) => {
  return map((loadable: Loadable<V>): Loadable<V[K]> => {
    if (loadable.loading) {
      return Loadable.loading;
    }

    const pluckedValue = loadable.value[key];
    return Loadable.loaded(pluckedValue);
  });
};
export const switchMapLoaded = <V, M>(
  project: (value: V) => Observable<M>
) => {
  return switchMap((loadable: Loadable<V>): Observable<Loadable<M>> => {
    if (loadable.loading) {
      return of(Loadable.loading);
    }

    const mappedValue$ = project(loadable.value);
    return mappedValue$.pipe(map(Loadable.loaded));
  });
};

export const mapLoadable: {
  <V>(loadingValue: V): OperatorFunction<Loadable<V>, V>;
  <V, M>(loadingValue: M, project: (value: V) => M): OperatorFunction<Loadable<V>, M>;
} = <V, M>(
  loadingValue: V | M,
  project?: (value: V) => M
) => {
    if (project == null) {
      return map((loadable: Loadable<V>): V => {
        if (loadable.loading) {
          return loadingValue as V;
        }

        return loadable.value;
      });
    } else {
      return map((loadable: Loadable<V>): M => {
        if (loadable.loading) {
          return loadingValue as M;
        }

        const mappedValue = project(loadable.value);
        return mappedValue;
      });
    }
  };
export const pluckLoadable = <V, K extends keyof V>(
  loadingValue: V[K],
  key: K
) => {
  return map((loadable: Loadable<V>): V[K] => {
    if (loadable.loading) {
      return loadingValue;
    }

    const pluckedValue = loadable.value[key];
    return pluckedValue;
  });
};
export const switchMapLoadable = <V, M>(
  loadingValue: M,
  project: (value: V) => Observable<M>
) => {
  return switchMap((loadable: Loadable<V>): Observable<M> => {
    if (loadable.loading) {
      return of(loadingValue);
    }

    const mappedValue$ = project(loadable.value);
    return mappedValue$;
  });
};

export const distinctUntilLoadableChanged = <V>(equals?: (value1: V, value2: V) => boolean) => {
  const effectiveEquals = equals ?? Object.is;
  return distinctUntilChanged((loadable1: Loadable<V>, loadable2: Loadable<V>) => (
    (loadable1.loading && loadable2.loading)
    || (!loadable1.loading && !loadable2.loading && effectiveEquals(loadable1.value, loadable2.value))
  ));
};

export const selectLoading = <V>(source: Observable<Loadable<V>>) => source.pipe(
  map(Loadable.isLoading),
  distinctUntilChanged()
);

export const selectInitialLoading = <V>(source: Observable<Loadable<V>>) => selectLoading(source).pipe(
  takeWhile(loading => loading),
  endWith(false)
);

export const selectLoadingBegan = <V>(source: Observable<Loadable<V>>) => selectLoading(source).pipe(
  filter(loading => loading),
  mapToVoid()
);

export const selectLoadedValue = <V>(source: Observable<Loadable<V>>) => source.pipe(
  filter(Loadable.isLoaded),
  pluck('value')
);

export const firstLoadedValueFrom = <V>(source: Observable<Loadable<V>>) => firstValueFrom(selectLoadedValue(source));
