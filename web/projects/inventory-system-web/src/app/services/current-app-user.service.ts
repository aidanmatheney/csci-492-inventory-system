import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {concat, Observable, of} from 'rxjs';
import {delay, map, retryWhen} from 'rxjs/operators';

import {partialRecordSet} from '../utils/array';
import {cacheUntil, filterNotNull, tapLog} from '../utils/observable';
import {
  distinctUntilLoadableChanged,
  Loadable,
  mapLoaded,
  selectLoadedValue,
  switchMapLoadable
} from "../utils/loading";
import {memoize} from '../utils/memo';

import {AuthenticationService} from './authentication.service';
import {Destroyed$} from './destroyed$.service';

import {environment} from '../../environments/environment';
import {AppRole, CurrentAppUser, CurrentAppUserDto} from '../models/app-user';

@Injectable({providedIn: 'root'})
export class CurrentAppUserService {
  private readonly baseUrl = `${environment.serverBaseUrl}/Api/CurrentAppUser`;

  public constructor(
    private readonly http: HttpClient,
    private readonly authenticationService: AuthenticationService,
    private readonly destroyed$: Destroyed$
  ) { }

  public readonly appUser$ = this.authenticationService.authenticated$.pipe(
    switchMapLoadable(Loadable.loading, (authenticated): Observable<Loadable<CurrentAppUser | undefined>> => {
      if (!authenticated) {
        return of(Loadable.loaded(undefined));
      }

      return concat(
        of(Loadable.loading),
        this.httpGetCurrentAppUser().pipe(
          map(({id, email, name, appRoles}) => Loadable.loaded({
            id,
            email,
            name,
            hasAppRoleByName: appRoles && partialRecordSet(appRoles)
          }))
        )
      );
    }),
    distinctUntilLoadableChanged(),
    tapLog('CurrentAppUserService appUser$'), // TODO: remove
    cacheUntil(this.destroyed$)
  );
  public readonly signedIn$ = this.appUser$.pipe(
    mapLoaded(appUser => appUser != null),
    distinctUntilLoadableChanged()
  );
  public readonly signedInAppUser$ = selectLoadedValue(this.appUser$).pipe(filterNotNull());

  public readonly selectHasAppRole = memoize((appRole: AppRole) => {
    return this.appUser$.pipe(
      mapLoaded(appUser => appUser?.hasAppRoleByName[appRole] ?? false),
      distinctUntilLoadableChanged()
    );
  });
  public readonly isSecretary$ = this.selectHasAppRole(AppRole.secretary);
  public readonly isAdministrator$ = this.selectHasAppRole(AppRole.administrator);

  private httpGetCurrentAppUser() {
    const url = this.baseUrl;
    return this.http.get<CurrentAppUserDto>(url).pipe(
      retryWhen(errors => errors.pipe(delay(2500)))
    );
  }
}
