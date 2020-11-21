import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable, Injector} from '@angular/core';
import {switchMap} from 'rxjs/operators';

import {lazy} from '../utils/lazy';
import {filterPluckLoaded} from '../utils/observable';

import {AuthenticationService} from '../services/authentication.service';

import {environment} from '../../environments/environment';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  // AuthenticationService uses HttpClient to send an unauthenticated request to the OIDC configuration endpoint,
  // causing a circular dependency if injected in this interceptor's constructor
  private readonly authenticationService = lazy(() => this.injector.get(AuthenticationService));

  public constructor(
    private readonly injector: Injector
  ) { }

  public intercept<T>(request: HttpRequest<T>, next: HttpHandler) {
    if (!this.requestShouldBeAuthenticated(request)) {
      return next.handle(request);
    }

    return this.authenticationService.value.accessToken$.pipe(
      filterPluckLoaded('accessToken'),
      switchMap(accessToken => {
        if (accessToken == null) {
          console.warn(
            'AuthenticationInterceptor intercept: the request should be authenticated, but there is no access token',
            {request}
          );
          return next.handle(request);
        }

        const authorizedRequest = request.clone({setHeaders: {Authorization: `Bearer ${accessToken}`}});
        console.warn('AuthenticationInterceptor intercept AUTHENTICATING', {
          accessToken,
          request,
          authorizedRequest
        }); // TODO: remove
        return next.handle(authorizedRequest);
      })
    );
  }

  private requestShouldBeAuthenticated<T>(request: HttpRequest<T>) {
    if (!request.url.startsWith(environment.serverBaseUrl)) {
      return false;
    }

    // OIDC client configuration
    if (request.url === `${environment.serverBaseUrl}/_configuration/${environment.oidcClientName}`) {
      return false;
    }

    return true;
  }
}
