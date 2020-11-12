import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {produce} from 'immer';

export abstract class StatefulService<S> {
  private readonly _state$: BehaviorSubject<S>;

  protected constructor(initialState: S) {
    this._state$ = new BehaviorSubject(initialState);
  }

  protected get state(): S {
    return this._state$.value;
  }

  protected get state$(): Observable<S> {
    return this._state$;
  }

  protected select<V>(selector: (state: S) => V): Observable<V> {
    return this._state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }

  protected update(updater: (state: S) => void): void {
    const nextState = produce(this._state$.value, (state: S) => {
      // Avoid passing updater directly, since it may not actually return void (allowed by TS), which would break immer
      updater(state);
    });
    this._state$.next(nextState);
  }
}
