import {HttpErrorResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

export const switchMapCaught404To = <T, R>(value$: Observable<R>) => {
  return catchError<T, Observable<R>>(error => (
    (error instanceof HttpErrorResponse && error.status === 404) ? value$
    : throwError(error)
  ));
};

export const mapCaught404To = <T, R>(value: R) => switchMapCaught404To<T, R>(of(value));
