import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {MatDrawerMode, MatSidenav} from '@angular/material/sidenav';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {delay, distinctUntilChanged, map, skip, startWith, switchMap, takeUntil, withLatestFrom} from 'rxjs/operators';

import {cacheUntil, firstValueFrom} from '../../utils/observable';
import {startFromAndSaveToLocalStorage} from '../../utils/storage';
import {mapLoadable, selectLoading} from '../../utils/loading';
import {SubType, typed} from '../../utils/type';

import {RouteInfoService} from '../../services/route-info.service';
import {ViewportService} from '../../services/viewport.service';
import {AppearanceService} from '../../services/appearance.service';
import {AuthenticationService} from '../../services/authentication.service';
import {CurrentAppUserService} from '../../services/current-app-user.service';
import {Destroyed$} from '../../services/destroyed$.service';

import {AppTheme} from '../../models/app-user-settings';
import {MatIconName} from '../../models/mat-icon';

const appThemeCssClassByName: Record<AppTheme, string> = {
  [AppTheme.light]: 'inventory-system-light-theme',
  [AppTheme.dark]: 'inventory-system-dark-theme'
};

interface NavListShortcut {
  title: string;
  icon: MatIconName;
  link: string;
  exact?: boolean;
  children?: NavListShortcut[]
}

@Component({
  selector: 'inventory-system-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSidenav) public sidenav!: MatSidenav;

  public readonly routeLoading$ = this.routeInfoService.loading$;

  public readonly narrowViewport$ = this.viewportService.narrow$;

  public readonly currentAppUserLoading$ = selectLoading(this.currentAppUserService.appUser$);
  public readonly signedIn$ = this.currentAppUserService.signedIn$.pipe(mapLoadable<boolean>(false));
  public readonly currentAppUserEmail$ = this.currentAppUserService.appUser$.pipe(
    mapLoadable(undefined, appUser => appUser?.email)
  );
  public readonly isSecretary$ = this.currentAppUserService.isSecretary$.pipe(mapLoadable<boolean>(false));
  public readonly isAdministrator$ = this.currentAppUserService.isAdministrator$.pipe(mapLoadable<boolean>(false));

  public readonly sidenavMode$ = this.narrowViewport$.pipe(
    map((narrowViewPort): SubType<MatDrawerMode, 'over' | 'side'> => narrowViewPort ? 'over' : 'side')
  );

  public readonly nextSidenavOpened$ = new Subject<boolean>();
  public readonly sidenavOpened$ = this.nextSidenavOpened$.pipe(
    startFromAndSaveToLocalStorage(
      'sidenavOpened',
      sidenavOpened => sidenavOpened,
      sidenavOpened => this.sidenavMode$.pipe(map(sidenavMode => sidenavMode === 'side' && (sidenavOpened ?? true)))
    ),
    distinctUntilChanged(),
    cacheUntil(this.destroyed$)
  );

  public readonly navListShortcuts$ = combineLatest([
    this.signedIn$,
    this.isSecretary$,
    this.isAdministrator$,
    this.routeInfoService.url$
  ]).pipe(
    map(([signedIn, isSecretary, isAdministrator, url]): ReadonlyArray<NavListShortcut> => [
      ...(!signedIn ? [
        {title: 'Home', icon: typed<MatIconName>('home'), link: '/', exact: true}
      ] : []),

      ...(isSecretary ? [
        {title: 'Dashboard', icon: typed<MatIconName>('home'), link: '/', exact: true},
        {title: 'Inventory', icon: typed<MatIconName>('keyboard'), link: '/inventory'}
      ] : []),

      ...(isAdministrator ? [
        {title: 'Admin', icon: typed<MatIconName>('admin_panel_settings'), link: '/admin', children: [
          {title: 'Users', icon: typed<MatIconName>('people'), link: '/admin/users', children: [
            {title: 'Create User', icon: typed<MatIconName>('person_add'), link: '/admin/users/create'},
            ...(/^\/admin\/users\/[^\/]+\/created$/.test(url) ? [
              {title: 'User Created', icon: typed<MatIconName>('done'), link: url}
            ] : []),
            ...(/^\/admin\/users\/[^\/]+\/edit$/.test(url) ? [
              {title: 'Edit User', icon: typed<MatIconName>('edit'), link: url}
            ] : [])
          ]}
        ]}
      ] : []),

      ...(signedIn ? [
        {title: 'Settings', icon: typed<MatIconName>('settings'), link: '/settings', children: [
          {title: 'Appearence', icon: typed<MatIconName>('color_lens'), link: '/settings/appearance'},
          {title: 'Security', icon: typed<MatIconName>('security'), link: '/settings/security'}
        ]}
      ] : []),

      {title: 'Help', icon: typed<MatIconName>('help'), link: '/help'}
    ]),
    cacheUntil(this.destroyed$)
  );

  public readonly sidenavContainerAutosize$ = combineLatest([
    this.navListShortcuts$.pipe(skip(1)),
    this.routeInfoService.url$.pipe(skip(1))
  ]).pipe(
    withLatestFrom(this.sidenavMode$, this.sidenavOpened$),
    switchMap(([, sidenavMode, sidenavOpened]) => {
      if (sidenavMode === 'over' || !sidenavOpened) {
        return of(false);
      }

      return of(false).pipe(
        delay(0),
        startWith(true)
      );
    }),
    startWith(false),
    distinctUntilChanged()
  );

  public constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly routeInfoService: RouteInfoService,
    private readonly viewportService: ViewportService,
    private readonly appearanceService: AppearanceService,
    private readonly authenticationService: AuthenticationService,
    private readonly currentAppUserService: CurrentAppUserService,
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

  public ngAfterViewInit() {
    this.sidenavMode$.pipe(
      skip(1),
      withLatestFrom(this.sidenavOpened$),
      takeUntil(this.destroyed$)
    ).subscribe(([sidenavMode, sidenavOpened]) => {
      if (sidenavMode === 'over' && sidenavOpened) {
        this.sidenav.close();
      } else if (sidenavMode === 'side' && !sidenavOpened) {
        this.sidenav.open();
      }
    });
  }

  public toggleSidenav() {
    this.sidenav.toggle();
  }

  public async handleShortcutClicked() {
    const sidenavMode = await firstValueFrom(this.sidenavMode$);
    if (sidenavMode === 'over') {
      this.sidenav.close();
    }
  }

  public signIn() {
    this.authenticationService.signIn();
  }

  public signOut() {
    this.authenticationService.signOut();
  }
}
