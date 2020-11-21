import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EMPTY} from 'rxjs';
import {delay, map, retryWhen, switchMap, tap} from 'rxjs/operators';

import {PartialRecordSet} from '../utils/record';
import {partialRecordSet} from '../utils/array';
import {cacheUntil, loadingValue$} from '../utils/observable';

import {AuthenticationService} from './authentication.service';
import {Destroyed$} from './destroyed$.service';

import {environment} from '../../environments/environment';
import {AppUser, AppRole} from '../models/user';

@Injectable({providedIn: 'root'})
export class CurrentAppUserService {
  private readonly state$ = loadingValue$<{
    appUser: AppUser | undefined;
    appRoles: PartialRecordSet<AppRole> | undefined;
  }>(next => {
    return this.authenticationService.authenticated$.pipe(
      switchMap(({loading: authenticatedLoading, authenticated}) => {
        if (authenticatedLoading) {
          next({loading: true});
          return EMPTY;
        }

        if (!authenticated) {
          next({
            loading: false,
            appUser: undefined,
            appRoles: undefined
          });
          return EMPTY;
        }

        next({loading: true});
        return this.getCurrentAppUserInfo().pipe(
          tap(({appUser, appRoles}) => next({
            loading: false,
            appUser,
            appRoles: appRoles && partialRecordSet(appRoles)
          }))
        );
      })
    ).subscribe();
  }).pipe(cacheUntil(this.destroyed$));

  public constructor(
    private readonly http: HttpClient,
    private readonly authenticationService: AuthenticationService,
    private readonly destroyed$: Destroyed$
  ) {
    this.appUser$.subscribe(appUser => console.error('CurrentAppUserService appUser:', appUser)); // TODO: remove
  }

  public readonly loading$ = this.state$.pipe(map(({loading}) => loading));

  public readonly signedIn$ = this.state$.pipe(map(({loading, appUser}) => ({loading, signedIn: appUser != null})));
  public readonly appUser$ = this.state$.pipe(map(({loading, appUser}) => ({loading, appUser})));

  public selectHasAppRole(appRole: AppRole) {
    return this.state$.pipe(map(({loading, appRoles}) => ({loading, hasAppRole: appRoles?.[appRole] ?? false})));
  }
  public readonly isSecretary$ = this.selectHasAppRole(AppRole.secretary);
  public readonly isAdministrator$ = this.selectHasAppRole(AppRole.administrator);

  private getCurrentAppUserInfo() {
    const url = `${environment.serverBaseUrl}/Api/AppUser/CurrentAppUserInfo`;
    return this.http.get<{
      id: string;
      email: string;
      name: string;
      roles: Array<AppRole>;
    }>(url).pipe(
      retryWhen(errors => errors.pipe(delay(2500))),
      map(({id, email, name, roles}) => ({
        appUser: {
          id,
          email,
          name
        },
        appRoles: roles
      }))
    );
  }
}
