import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {firstLoadedValueFrom} from '../utils/loading';

import {CurrentAppUserService} from '../services/current-app-user.service';

@Injectable({providedIn: 'root'})
export class SignedInGuard implements CanActivate {
  public constructor(
    private readonly router: Router,
    private readonly currentAppUserService: CurrentAppUserService
  ) { }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const signedIn = await firstLoadedValueFrom(this.currentAppUserService.signedIn$);
    if (!signedIn) {
      return this.router.createUrlTree(['/'], {queryParams: {
        returnUrl: state.url
      }});
    }

    return true;
  }
}
