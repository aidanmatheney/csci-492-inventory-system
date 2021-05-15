import {Injectable, OnDestroy} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';

@Injectable()
export class Destroyed$ extends Observable<void> implements OnDestroy {
  private readonly destroyed$ = new ReplaySubject<void>(1);

  public constructor() {
    super(subscriber => this.destroyed$.subscribe(subscriber));
  }

  public ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
