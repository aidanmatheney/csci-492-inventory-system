import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

import {mapToVoid} from './observable';

export interface IdleProcessingState {
  state: 'idle';
}
export interface StartedProcessingState {
  state: 'started';
}
export interface CompletedProcessingState {
  state: 'completed';
}
export interface ErroredProcessingState {
  state: 'errored';
  errors: string[];
}
export type ProcessingState = (
  | IdleProcessingState
  | StartedProcessingState
  | CompletedProcessingState
  | ErroredProcessingState
);

export const ProcessingState: {
  idle: IdleProcessingState;
  started: StartedProcessingState;
  completed: CompletedProcessingState;
  errored(firstError: string, ...otherErrors: string[]): ErroredProcessingState;

  isIdle(processingState: ProcessingState): processingState is IdleProcessingState;
  isStarted(processingState: ProcessingState): processingState is StartedProcessingState;
  isCompleted(processingState: ProcessingState): processingState is CompletedProcessingState;
  isErrored(processingState: ProcessingState): processingState is ErroredProcessingState;
} = {
  idle: ({state: 'idle'}),
  started: ({state: 'started'}),
  completed: ({state: 'completed'}),
  errored: (...errors) => ({state: 'errored', errors}),

  isIdle: (processingState): processingState is IdleProcessingState => processingState.state === 'idle',
  isStarted: (processingState): processingState is StartedProcessingState => processingState.state === 'started',
  isCompleted: (processingState): processingState is CompletedProcessingState => processingState.state === 'completed',
  isErrored: (processingState): processingState is ErroredProcessingState => processingState.state === 'errored'
};

export class OngoingOperations {
  private readonly _count$ = new BehaviorSubject(0);

  public readonly count$: Observable<number> = this._count$;
  public readonly none$ = this.count$.pipe(
    filter(count => count === 0),
    mapToVoid()
  );

  public async incrementWhile<T>(operation: () => Promise<T>) {
    this._count$.next(this._count$.value + 1);

    try {
      const result = await operation();
      this._count$.next(this._count$.value - 1);
      return result;
    } catch (error: unknown) {
      this._count$.next(this._count$.value - 1);
      throw error;
    }
  }
}
