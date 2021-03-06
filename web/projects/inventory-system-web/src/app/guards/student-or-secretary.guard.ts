import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {combineLatest} from 'rxjs';

import {firstValueFrom} from '../utils/observable';
import {selectLoadedValue} from '../utils/loading';

import {CurrentAppUserService} from '../services/current-app-user.service';

@Injectable({providedIn: 'root'})
export class StudentOrSecretaryGuard implements CanActivate {
  public constructor(
    private readonly router: Router,
    private readonly currentAppUserService: CurrentAppUserService
  ) { }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const [
      signedIn,
      isStudentOrSecretary
    ] = await firstValueFrom(combineLatest([
      selectLoadedValue(this.currentAppUserService.signedIn$),
      selectLoadedValue(this.currentAppUserService.isStudentOrSecretary$)
    ]));

    if (!signedIn) {
      return this.router.createUrlTree(['/'], {queryParams: {
        returnUrl: state.url
      }});
    }

    if (!isStudentOrSecretary) {
      return this.router.parseUrl('/');
    }

    return true;
  }
}
