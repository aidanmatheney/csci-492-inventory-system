import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {AuthenticationService} from '../services/authentication.service';

@Injectable({providedIn: 'root'})
export class SignOutCallbackGuard implements CanActivate {
  public constructor(
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService
  ) { }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const result = await this.authenticationService.processSignOutCallback(state.url);
    if (!result.success) {
      console.error('SignOutCallbackGuard error', {
        route,
        state,
        result
      }); // TODO: remove
      return this.router.parseUrl('/');
    }

    return this.router.parseUrl(result.returnUrl ?? '/');
  }
}
