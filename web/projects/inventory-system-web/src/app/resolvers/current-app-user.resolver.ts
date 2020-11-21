import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {filter} from 'rxjs/operators';

import {firstValueFrom} from '../utils/observable';

import {CurrentAppUserService} from '../services/current-app-user.service';

@Injectable({providedIn: 'root'})
export class CurrentAppUserResolver implements Resolve<void> {
  public constructor(
    private readonly currentAppUserService: CurrentAppUserService
  ) { }

  public async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    await firstValueFrom(this.currentAppUserService.loading$.pipe(filter(loading => !loading)));
  }
}
