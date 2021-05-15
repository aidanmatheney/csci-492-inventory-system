import {BehaviorSubject, Observable} from 'rxjs';
import {filter, mapTo} from 'rxjs/operators';

import {VOID} from './type';

export interface IdleProcessingState {
  status: 'idle';
}
export interface StartedProcessingState {
  status: 'started';
}
export interface SucceededProcessingState {
  status: 'succeeded';
}
export interface FailedProcessingState {
  status: 'failed';
  errors: string[];
}
export type ProcessingState = (
  | IdleProcessingState
  | StartedProcessingState
  | SucceededProcessingState
  | FailedProcessingState
);

export const ProcessingState: {
  idle: IdleProcessingState;
  started: StartedProcessingState;
  succeeded: SucceededProcessingState;
  failed(firstError: string, ...otherErrors: readonly string[]): FailedProcessingState;

  isIdle(processingState: ProcessingState): processingState is IdleProcessingState;
  isStarted(processingState: ProcessingState): processingState is StartedProcessingState;
  isSucceeded(processingState: ProcessingState): processingState is SucceededProcessingState;
  isFailed(processingState: ProcessingState): processingState is FailedProcessingState;
} = {
  idle: {status: 'idle'},
  started: {status: 'started'},
  succeeded: {status: 'succeeded'},
  failed: (...errors) => ({status: 'failed', errors}),

  isIdle: (processingState): processingState is IdleProcessingState => processingState.status === 'idle',
  isStarted: (processingState): processingState is StartedProcessingState => processingState.status === 'started',
  isSucceeded: (processingState): processingState is SucceededProcessingState => processingState.status === 'succeeded',
  isFailed: (processingState): processingState is FailedProcessingState => processingState.status === 'failed'
};

export class OngoingOperations {
  private readonly _count$ = new BehaviorSubject(0);

  public readonly count$: Observable<number> = this._count$;
  public readonly none$ = this.count$.pipe(
    filter(count => count === 0),
    mapTo(VOID)
  );

  public async incrementWhile<T>(operation: () => Promise<T>) {
    this._count$.next(this._count$.value + 1);

    try {
      return await operation();
    } finally {
      this._count$.next(this._count$.value - 1);
    }
  }
}
