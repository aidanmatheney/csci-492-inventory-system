import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EMPTY, merge, Observable, of, Subject} from 'rxjs';
import {catchError, delay, filter, first, map, retryWhen, startWith, switchMap, switchMapTo} from 'rxjs/operators';

import {partialRecordSet} from '../utils/array';
import {cacheUntil} from '../utils/observable';
import {tapLog} from '../utils/debug';
import {
  distinctUntilLoadableChanged,
  Loadable,
  mapLoaded,
  selectLoadedValue,
  switchMapLoadable
} from '../utils/loading';
import {memoize} from '../utils/memo';
import {startFromAndSaveToLocalStorage} from '../utils/storage';
import {isNotNull} from '../utils/filter';

import {AuthenticationService} from './authentication.service';
import {Destroyed$} from './destroyed$.service';

import {environment} from '../../environments/environment';
import {CurrentAppUser, CurrentAppUserDto} from '../models/app-user';
import {AppRole} from '../models/app-role';
import {CurrentAppUserSettings, CurrentAppUserSettingsDto} from '../models/app-user-settings';

@Injectable({providedIn: 'root'})
export class CurrentAppUserService {
  private readonly baseUrl = `${environment.serverBaseUrl}/Api/CurrentAppUser`;
  private readonly settingsUrl = `${this.baseUrl}/Settings`;

  public constructor(
    private readonly http: HttpClient,
    private readonly authenticationService: AuthenticationService,
    private readonly destroyed$: Destroyed$
  ) { }

  public readonly appUser$ = this.authenticationService.userId$.pipe(
    switchMapLoadable(Loadable.loading, (userId): Observable<Loadable<CurrentAppUser | undefined>> => {
      if (userId == null) {
        return of(Loadable.loaded(undefined));
      }

      return this.httpGetCurrentAppUser().pipe(
        map(({id, email, name, appRoles}) => Loadable.loaded({
          id,
          email,
          name,
          hasAppRoleByName: appRoles && partialRecordSet(appRoles)
        })),
        startWith(Loadable.loading)
      );
    }),
    distinctUntilLoadableChanged(),
    tapLog('CurrentAppUserService appUser$', 'warn'), // TODO: remove
    cacheUntil(this.destroyed$)
  );
  public readonly signedIn$ = this.appUser$.pipe(
    mapLoaded(appUser => appUser != null),
    distinctUntilLoadableChanged()
  );
  public readonly signedInAppUser$ = selectLoadedValue(this.appUser$).pipe(filter(isNotNull));

  public readonly selectHasAppRole = memoize((appRole: AppRole) => {
    return this.appUser$.pipe(
      mapLoaded(appUser => appUser?.hasAppRoleByName[appRole] ?? false),
      distinctUntilLoadableChanged()
    );
  });
  public readonly isSecretary$ = this.selectHasAppRole(AppRole.secretary);
  public readonly isAdministrator$ = this.selectHasAppRole(AppRole.administrator);

  private readonly nextSettings$ = new Subject<CurrentAppUserSettings>();
  public readonly settings$ = merge(
    selectLoadedValue(this.appUser$).pipe(
      filter(isNotNull),
      switchMapTo(this.httpGetCurrentAppUserSettings()),
      map(({theme}): CurrentAppUserSettings => ({
        theme: theme ?? undefined
      }))
    ),
    this.nextSettings$.pipe(
      switchMap(nextSettings => selectLoadedValue(this.signedIn$).pipe(
        filter(signedIn => signedIn),
        first(),
        switchMapTo(this.httpSetCurrentAppUserSettings({
          theme: nextSettings.theme ?? null
        })),
        switchMapTo(EMPTY),
        catchError(error => {
          console.error('Error saving app user settings', error);
          return EMPTY;
        }),
        startWith(nextSettings)
      ))
    )
  ).pipe(
    startFromAndSaveToLocalStorage(
      'settings',
      settings => settings,
      settings => of(settings ?? {
        theme: undefined
      })
    ),
    tapLog('CurrentAppUserService settings$', 'warn'), // TODO: remove
    cacheUntil(this.destroyed$)
  );

  public setSettings(settings: CurrentAppUserSettings) {
    this.nextSettings$.next(settings);
  }

  private httpGetCurrentAppUser() {
    const url = this.baseUrl;
    return this.http.get<CurrentAppUserDto>(url).pipe(
      retryWhen(errors => errors.pipe(delay(2500)))
    );
  }

  private httpGetCurrentAppUserSettings() {
    const url = this.settingsUrl;
    return this.http.get<CurrentAppUserSettingsDto>(url).pipe(
      retryWhen(errors => errors.pipe(delay(2500)))
    );
  }

  private httpSetCurrentAppUserSettings(settings: CurrentAppUserSettingsDto) {
    const url = this.settingsUrl;
    return this.http.put<void>(url, settings);
  }
}
