import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {filter} from 'rxjs/operators';

import {firstValueFrom} from '../utils/observable';

import {CurrentUserService} from '../services/current-user.service';

@Injectable({providedIn: 'root'})
export class CurrentUserResolver implements Resolve<void> {
  public constructor(
    private readonly currentUserService: CurrentUserService
  ) { }

  public async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    await firstValueFrom(this.currentUserService.loading$.pipe(filter(loading => !loading)));
  }
}
