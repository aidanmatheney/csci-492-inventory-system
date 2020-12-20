import {Component, Inject, OnInit} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {ActivationStart, NavigationCancel, NavigationEnd, NavigationError, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, switchMap, takeUntil} from 'rxjs/operators';

import {AppearanceService} from './services/appearance.service';
import {Destroyed$} from './services/destroyed$.service';

import {AppTheme} from './models/app-user-settings';

const appThemeCssClassByName: Record<AppTheme, string> = {
  [AppTheme.light]: 'inventory-system-light-theme',
  [AppTheme.dark]: 'inventory-system-dark-theme'
};

@Component({
  selector: 'inventory-system-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [Destroyed$]
})
export class AppComponent implements OnInit {
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
    distinctUntilChanged()
  );

  public constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly router: Router,
    private readonly appearanceService: AppearanceService,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    this.appearanceService.appTheme$.pipe(
      switchMap(appTheme => new Observable<void>(() => {
        const cssClass = appThemeCssClassByName[appTheme];
        this.document.body.classList.add(cssClass);
        return () => this.document.body.classList.remove(cssClass);
      })),
      takeUntil(this.destroyed$)
    ).subscribe();
  }
}
