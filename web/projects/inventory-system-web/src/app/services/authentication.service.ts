import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {delay, map, retryWhen, switchMap, tap} from 'rxjs/operators';
import {
  UserManager as OidcUserManager,
  UserManagerSettings as OidcUserManagerSettings,
  User as OidcUser,
  WebStorageStateStore as OidcWebStorageStateStore
} from 'oidc-client';

import {cacheUntil, firstValueFrom, loadingValue$} from '../utils/observable';

import {Destroyed$} from './destroyed$.service';

import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private readonly oidcUserManager$ = this.getAppOidcConfiguration().pipe(
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
      console.error('AuthenticationService _oidcUserManager$', {
        appOidcConfiguration,
        oidcUserManagerSettings,
        oidcUserManager
      }); // TODO: remove
      return oidcUserManager;
    }),
    cacheUntil(this.destroyed$)
  );

  private readonly state$ = loadingValue$<{oidcUser: OidcUser | undefined;}>(next => {
    return this.oidcUserManager$.pipe(
      switchMap(oidcUserManager => new Observable<OidcUserManager>(subscriber => {
        oidcUserManager.events.addAccessTokenExpiring((...a) => console.error('userManager.events.addAccessTokenExpiring', a)); // TODO: remove
        oidcUserManager.events.addSilentRenewError((...a) => console.error('userManager.events.addSilentRenewError', a)); // TODO: remove
        oidcUserManager.events.addUserSessionChanged((...a) => console.error('userManager.events.addUserSessionChanged', a)); // TODO: remove

        const handleOidcUserLoaded = (oidcUser: OidcUser) => {
          console.error('OIDC userLoaded', {oidcUser}); // TODO: remove
          next({loading: false, oidcUser});
        };
        oidcUserManager.events.addUserLoaded(handleOidcUserLoaded);

        const handleOidcUserUnloaded = () => {
          console.error('OIDC userUnloaded'); // TODO: remove
          next({loading: false, oidcUser: undefined});
        };
        oidcUserManager.events.addUserUnloaded(handleOidcUserUnloaded);

        const handleOidcUserSignedOut = () => {
          console.error('OIDC userSignedOut'); // TODO: remove
          oidcUserManager.removeUser();
        };
        oidcUserManager.events.addUserSignedOut(handleOidcUserSignedOut);

        const handleOidcAccessTokenExpired = () => {
          console.error('OIDC accessTokenExpired'); // TODO: remove
          oidcUserManager.removeUser();
        };
        oidcUserManager.events.addAccessTokenExpired(handleOidcAccessTokenExpired);

        subscriber.next(oidcUserManager);
        return () => {
          oidcUserManager.events.removeUserLoaded(handleOidcUserLoaded);
          oidcUserManager.events.removeUserUnloaded(handleOidcUserUnloaded);
          oidcUserManager.events.removeUserSignedOut(handleOidcUserSignedOut);
          oidcUserManager.events.removeAccessTokenExpired(handleOidcAccessTokenExpired);
        };
      })),
      switchMap(async oidcUserManager => {
        next({loading: true});
        return (await oidcUserManager.getUser()) ?? undefined;
      }),
      tap(storedOidcUser => next({loading: false, oidcUser: storedOidcUser}))
    ).subscribe();
  }).pipe(cacheUntil(this.destroyed$));

  public constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly destroyed$: Destroyed$
  ) {
    this.oidcUser$.subscribe(oidcUser => console.error('AuthenticationService oidcUser:', oidcUser)); // TODO: remove
  }

  public readonly loading$ = this.state$.pipe(map(({loading}) => loading));

  public readonly authenticated$ = this.state$.pipe(map(({loading, oidcUser}) => ({loading, authenticated: oidcUser != null})));
  public readonly oidcUser$ = this.state$.pipe(map(({loading, oidcUser}) => ({loading, oidcUser})));
  public readonly accessToken$ = this.state$.pipe(map(({loading, oidcUser}) =>({loading, accessToken: oidcUser?.access_token})));

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

  private getAppOidcConfiguration() {
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
