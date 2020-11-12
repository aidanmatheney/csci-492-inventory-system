import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {filterPluckLoaded, firstValueFrom} from '../utils/observable';

import {AuthenticationService} from '../services/authentication.service';
import {CurrentUserService} from '../services/current-user.service';

@Injectable({providedIn: 'root'})
export class SignInCallbackGuard implements CanActivate {
  public constructor(
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService,
    private readonly currentUserService: CurrentUserService
  ) { }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const signedIn = await firstValueFrom(this.currentUserService.signedIn$.pipe(filterPluckLoaded('signedIn')));

    const {
      token,
      returnUrl
    } = route.queryParams as {
      token?: string;
      returnUrl?: string;
    };

    console.error('SignInCallbackGuard canActivate', {
      route,
      state,
      signedIn,
      token,
      returnUrl
    });

    if (signedIn || token == null) {
      return this.router.parseUrl(returnUrl ?? '/');
    }

    this.authenticationService.handleSignInSuccess(token);
    return this.router.parseUrl(returnUrl ?? '/');
  }
}
