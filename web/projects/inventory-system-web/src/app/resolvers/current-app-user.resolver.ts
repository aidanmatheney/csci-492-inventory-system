import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';

import {firstValueFrom} from '../utils/observable';
import {selectLoadedValue} from "../utils/loading";

import {CurrentAppUserService} from '../services/current-app-user.service';

@Injectable({providedIn: 'root'})
export class CurrentAppUserResolver implements Resolve<void> {
  public constructor(
    private readonly currentAppUserService: CurrentAppUserService
  ) { }

  public async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    await firstValueFrom(selectLoadedValue(this.currentAppUserService.appUser$));
  }
}
