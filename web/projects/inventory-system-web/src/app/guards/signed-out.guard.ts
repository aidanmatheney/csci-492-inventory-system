import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {filterPluckLoaded, firstValueFrom} from '../utils/observable';

import {CurrentAppUserService} from '../services/current-app-user.service';

@Injectable({providedIn: 'root'})
export class SignedOutGuard implements CanActivate {
  public constructor(
    private readonly router: Router,
    private readonly currentAppUserService: CurrentAppUserService
  ) { }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const signedIn = await firstValueFrom(this.currentAppUserService.signedIn$.pipe(filterPluckLoaded('signedIn')));
    if (signedIn) {
      return this.router.parseUrl('/');
    }

    return true;
  }
}
