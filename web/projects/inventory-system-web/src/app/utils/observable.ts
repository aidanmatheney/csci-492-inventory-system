import {Observable} from 'rxjs';
import {filter, first, map, pluck} from 'rxjs/operators';

export const firstValueFrom = <V>(value$: Observable<V>) => {
  return new Promise<V>((resolve, reject) => {
    value$.pipe(first()).subscribe(resolve, reject);
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
