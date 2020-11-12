import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {filterPluckLoaded, firstValueFrom} from '../utils/observable';

import {CurrentUserService} from '../services/current-user.service';

@Injectable({providedIn: 'root'})
export class AuthenticatedGuard implements CanActivate {
  public constructor(
    private readonly router: Router,
    private readonly currentUserService: CurrentUserService
  ) { }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const signedIn = await firstValueFrom(this.currentUserService.signedIn$.pipe(filterPluckLoaded('signedIn')));
    if (!signedIn) {
      return this.router.createUrlTree(['/'], {queryParams: {
        returnUrl: state.url
      }});
    }

    return true;
  }
}
