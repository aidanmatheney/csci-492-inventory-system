import {Injectable} from '@angular/core';
import {ActivationStart, NavigationCancel, NavigationEnd, NavigationError, Router, UrlTree} from '@angular/router';
import {distinctUntilChanged, filter, map, startWith} from 'rxjs/operators';

import {cacheUntil} from '../utils/observable';
import {VOID} from '../utils/type';

import {Destroyed$} from './destroyed$.service';

@Injectable({providedIn: 'root'})
export class RouteInfoService {
  public constructor(
    private readonly router: Router,
    private readonly destroyed$: Destroyed$
  ) { }

  public readonly loading$ = this.router.events.pipe(
    filter((event): event is (
      | ActivationStart // CanDeactivate guards run after NavigationStart but before ActivationStart
      | NavigationEnd
      | NavigationCancel
      | NavigationError
    ) => (
      event instanceof ActivationStart
      || event instanceof NavigationEnd
      || event instanceof NavigationCancel
      || event instanceof NavigationError
    )),
    map(event => event instanceof ActivationStart),
    startWith(true),
    distinctUntilChanged(),
    cacheUntil(this.destroyed$)
  );

  public readonly url$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(VOID),
    map(() => this.router.url),
    distinctUntilChanged(),
    cacheUntil(this.destroyed$)
  );

  public selectUrlActive(url: string | UrlTree, exact?: boolean) {
    return this.url$.pipe(
      map(() => this.router.isActive(url, exact ?? false)),
      distinctUntilChanged()
    );
  }

  public selectUrlPatternActive(pattern: RegExp) {
    return this.url$.pipe(
      map(url => pattern.test(url)),
      distinctUntilChanged()
    );
  }
}
