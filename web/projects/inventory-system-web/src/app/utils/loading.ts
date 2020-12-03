import {Observable, of, OperatorFunction} from 'rxjs';
import {distinctUntilChanged, filter, map, pluck, switchMap} from 'rxjs/operators';

import {mapToVoid} from './observable';

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
  return map((result: Loadable<V>): Loadable<M> => {
    if (result.loading) {
      return Loadable.loading;
    }

    const mappedValue = project(result.value);
    return Loadable.loaded(mappedValue);
  });
};
export const pluckLoaded = <V, K extends keyof V>(
  key: K
) => {
  return map((result: Loadable<V>): Loadable<V[K]> => {
    if (result.loading) {
      return Loadable.loading;
    }

    const pluckedValue = result.value[key];
    return Loadable.loaded(pluckedValue);
  });
};
export const switchMapLoaded = <V, M>(
  project: (value: V) => Observable<M>
) => {
  return switchMap((result: Loadable<V>): Observable<Loadable<M>> => {
    if (result.loading) {
      return of(Loadable.loading);
    }

    const mappedValue$ = project(result.value);
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
      return map((result: Loadable<V>): V => {
        if (result.loading) {
          return loadingValue as V;
        }

        return result.value;
      });
    } else {
      return map((result: Loadable<V>): M => {
        if (result.loading) {
          return loadingValue as M;
        }

        const mappedValue = project(result.value);
        return mappedValue;
      });
    }
  };
export const pluckLoadable = <V, K extends keyof V>(
  loadingValue: V[K],
  key: K
) => {
  return map((result: Loadable<V>): V[K] => {
    if (result.loading) {
      return loadingValue;
    }

    const pluckedValue = result.value[key];
    return pluckedValue;
  });
};
export const switchMapLoadable = <V, M>(
  loadingValue: M,
  project: (value: V) => Observable<M>
) => {
  return switchMap((result: Loadable<V>): Observable<M> => {
    if (result.loading) {
      return of(loadingValue);
    }

    const mappedValue$ = project(result.value);
    return mappedValue$;
  });
};

export const filterDistinctLoadable = <V>() => {
  return distinctUntilChanged((loadable1: Loadable<V>, loadable2: Loadable<V>) => (
    (loadable1.loading && loadable2.loading)
    || (!loadable1.loading && !loadable2.loading && Object.is(loadable1.value, loadable2.value))
  ));
};

export const selectLoading = <V>(source: Observable<Loadable<V>>) => source.pipe(
  map(Loadable.isLoading),
  distinctUntilChanged()
);

export const selectLoadingBegan = <V>(source: Observable<Loadable<V>>) => selectLoading(source).pipe(
  filter(loading => loading),
  mapToVoid()
);

export const selectLoadedValue = <V>(source: Observable<Loadable<V>>) => source.pipe(
  filter(Loadable.isLoaded),
  pluck('value')
);
