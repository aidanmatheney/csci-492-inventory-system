import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, ActivationStart, NavigationCancel, Router} from '@angular/router';
import {concat, EMPTY, from, merge, of, race} from 'rxjs';
import {
  catchError,
  delay,
  filter,
  first,
  map,
  mapTo,
  retryWhen,
  startWith,
  switchMap,
  switchMapTo
} from 'rxjs/operators';
import {
  UserManager as OidcUserManager,
  UserManagerSettings as OidcUserManagerSettings,
  User as OidcUser,
  WebStorageStateStore as OidcWebStorageStateStore
} from 'oidc-client';

import {cacheUntil, firstValueFrom, tapLog} from '../utils/observable';
import {distinctUntilLoadableChanged, Loadable, mapLoaded} from "../utils/loading";
import {
  selectOidcAccessTokenExpired,
  selectOidcUserLoaded,
  selectOidcUserSignedOut,
  selectOidcUserUnloaded
} from '../utils/oidc';

import {Destroyed$} from './destroyed$.service';

import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private readonly oidcUserManager$ = this.httpGetAppOidcConfiguration().pipe(
    map(appOidcConfiguration => {
      const oidcUserManagerSettings: OidcUserManagerSettings = {
        authority: appOidcConfiguration.authority,
        client_id: appOidcConfiguration.client_id,
        redirect_uri: appOidcConfiguration.redirect_uri,
        post_logout_redirect_uri: appOidcConfiguration.post_logout_redirect_uri,
        response_type: appOidcConfiguration.response_type,
        scope: appOidcConfiguration.scope,

        userStore: new OidcWebStorageStateStore({store: localStorage}),
        automaticSilentRenew: true,
        silent_redirect_uri: `${environment.webAppBaseUrl}/silent-authentication-renew.html`
      };
      const oidcUserManager = new OidcUserManager(oidcUserManagerSettings);
      return oidcUserManager;
    }),
    cacheUntil(this.destroyed$)
  );

  private readonly oidcUserWasLoadedInSignInCallback$ = this.router.events.pipe(
    filter((routerEvent): routerEvent is ActivationStart => routerEvent instanceof ActivationStart),
    first(),
    switchMap(activationStartEvent => {
      const firstPathPart = activationStartEvent.snapshot.routeConfig?.path;
      if (firstPathPart !== 'sign-in-callback') {
        return of(false);
      }

      return race(
        this.oidcUserManager$.pipe(
          switchMap(selectOidcUserLoaded),
          mapTo('oidcUserLoaded' as const)
        ),
        this.router.events.pipe(
          filter(routerEvent => routerEvent instanceof NavigationCancel),
          mapTo('signInCallbackGuardCompleted' as const)
        )
      ).pipe(
        first(),
        map(event => event === 'oidcUserLoaded')
      );
    }),
    cacheUntil(this.destroyed$)
  );

  public constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly destroyed$: Destroyed$
  ) {
    // this.router.events.subscribe(event => console.warn('router:', event)); // TODO: remove
  }

  public readonly oidcUser$ = merge(
    this.oidcUserWasLoadedInSignInCallback$.pipe(
      filter(oidcUserWasLoadedInSignInCallback => !oidcUserWasLoadedInSignInCallback),
      switchMapTo(this.oidcUserManager$),
      switchMap(oidcUserManager => from(oidcUserManager.getUser()).pipe(
        switchMap(storedOidcUser => {
          if (storedOidcUser != null) {
            return of(Loadable.loaded(storedOidcUser));
          }

          return from(oidcUserManager.signinSilent()).pipe(
            switchMapTo(EMPTY),
            catchError(() => of(Loadable.loaded(undefined)))
          );
        })
      ))
    ),
    this.oidcUserManager$.pipe(
      switchMap(oidcUserManager => merge(
        selectOidcUserLoaded(oidcUserManager).pipe(map(Loadable.loaded)),
        selectOidcUserUnloaded(oidcUserManager).pipe(mapTo(Loadable.loaded(undefined))),
        selectOidcUserSignedOut(oidcUserManager).pipe(
          switchMap(() => oidcUserManager.removeUser()),
          switchMapTo(EMPTY)
        ),
        selectOidcAccessTokenExpired(oidcUserManager).pipe(
          switchMap(() => concat(
            of(Loadable.loading),
            from(oidcUserManager.signinSilent()).pipe(
              switchMapTo(EMPTY),
              catchError(() => EMPTY)
            )
          ))
        )
      ))
    )
  ).pipe(
    startWith<Loadable<OidcUser | undefined>>(Loadable.loading),
    distinctUntilLoadableChanged(),
    tapLog('AuthenticationService oidcUser$'), // TODO: remove
    cacheUntil(this.destroyed$)
  );
  public readonly authenticated$ = this.oidcUser$.pipe(
    mapLoaded(oidcUser => oidcUser != null),
    distinctUntilLoadableChanged()
  );
  public readonly accessToken$ = this.oidcUser$.pipe(
    mapLoaded(oidcUser => oidcUser?.access_token),
    distinctUntilLoadableChanged()
  );

  public async signIn() {
    const queryParams = this.route.snapshot.queryParams as {
      returnUrl?: string;
    };
    const returnUrl = queryParams.returnUrl ?? this.router.url;
    console.error('AuthenticationService signIn', {returnUrl}); // TODO: remove

    const oidcUserManager = await firstValueFrom(this.oidcUserManager$);
    await oidcUserManager.signinRedirect({state: {returnUrl}});
  }

  public async processSignInCallback(url: string): Promise<
    | {success: true; returnUrl?: string;}
    | {success: false; error: unknown;}
  > {
    console.error('AuthenticationService processSignInCallback', {url}); // TODO: remove

    const oidcUserManager = await firstValueFrom(this.oidcUserManager$);
    try {
      const user = await oidcUserManager.signinRedirectCallback(url);

      const state = user.state as {
        returnUrl?: string;
      } | undefined;
      const returnUrl = state?.returnUrl;

      console.error('AuthenticationService processSignInCallback response', {url, user, returnUrl}); // TODO: remove
      return {success: true, returnUrl};
    } catch (error: unknown) {
      console.error('Error processing sign-in callback', error); // TODO: remove
      return {success: false, error};
    }
  }

  public async signOut() {
    const returnUrl = this.router.url;
    console.error('AuthenticationService signOut', {returnUrl}); // TODO: remove

    const oidcUserManager = await firstValueFrom(this.oidcUserManager$);
    await oidcUserManager.signoutRedirect({state: {returnUrl}});
  }

  public async processSignOutCallback(url: string): Promise<
    | {success: true; returnUrl?: string;}
    | {success: false; error: unknown;}
  > {
    console.error('AuthenticationService processSignOutCallback', {url}); // TODO: remove

    const oidcUserManager = await firstValueFrom(this.oidcUserManager$);
    try {
      const response = await oidcUserManager.signoutRedirectCallback(url);
      if (response.error != null) {
        return {success: false, error: response};
      }

      const state = response.state as {
        returnUrl?: string;
      } | undefined;
      const returnUrl = state?.returnUrl;

      console.error('AuthenticationService processSignOutCallback response', {url, response, returnUrl}); // TODO: remove
      return {success: true, returnUrl};
    } catch (error: unknown) {
      console.error('Error processing sign-out callback', error); // TODO: remove
      return {success: false, error};
    }
  }

  private httpGetAppOidcConfiguration() {
    const url = `${environment.serverBaseUrl}/_configuration/${environment.oidcClientName}`;
    return this.http.get<{
      authority: string;
      client_id: string;
      redirect_uri: string;
      post_logout_redirect_uri: string;
      response_type: string;
      scope: string;
    }>(url).pipe(
      retryWhen(errors => errors.pipe(delay(2500)))
    );
  }
}
