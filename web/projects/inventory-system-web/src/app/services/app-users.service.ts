import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  pluck,
  retryWhen,
  skip,
  startWith,
  switchMapTo,
  takeUntil
} from 'rxjs/operators';

import {recordBy} from '../utils/array';
import {cacheUntil, firstValueFrom} from '../utils/observable';
import {tapLog} from '../utils/debug';
import {distinctUntilLoadableChanged, Loadable, mapLoaded, pluckLoaded} from '../utils/loading';
import {partialRecord, partialRecordSetOf} from '../utils/record';
import {memoize} from '../utils/memo';
import {produceBehaviorSubjectMutable} from '../utils/immutable';
import {OngoingOperations} from '../utils/processing';
import {VOID} from '../utils/type';

import {BroadcastService} from './broadcast.service';
import {Destroyed$} from './destroyed$.service';

import {environment} from '../../environments/environment';
import {OtherAppUser, OtherAppUserDto} from '../models/app-user';
import {AppRole} from '../models/app-role';

@Injectable({providedIn: 'root'})
export class AppUsersService {
  private readonly baseUrl = `${environment.serverBaseUrl}/Api/AppUsers`;

  private readonly ongoingModifications = new OngoingOperations();

  private readonly refreshInventory$ = combineLatest([
    this.ongoingModifications.count$,
    this.broadcastService.refreshUsers$.pipe(startWith(VOID))
  ]).pipe(
    filter(([ongoingModificationCount]) => ongoingModificationCount === 0),
    mapTo(VOID)
  );

  public constructor(
    private readonly http: HttpClient,
    private readonly broadcastService: BroadcastService,
    private readonly destroyed$: Destroyed$
  ) {
    this.ongoingModifications.none$.pipe(
      skip(1),
      takeUntil(this.destroyed$)
    ).subscribe(() => this.broadcastService.refreshUsers());
  }

  public readonly appUsers$ = this.refreshInventory$.pipe(
    switchMapTo(this.httpGetAll().pipe(
      map(otherAppUserDtos => Loadable.loaded(otherAppUserDtos.map(({
        id,
        email,
        name,
        emailConfirmed,
        hasPassword,
        lockedOut,
        appRoles
      }): OtherAppUser => ({
        id,
        email,
        name,
        emailConfirmed,
        hasPassword,
        lockedOut,
        hasAppRoleByName: appRoles && partialRecordSetOf(appRoles)
      })))),
      startWith(Loadable.loading)
    )),
    startWith(Loadable.loading),
    distinctUntilLoadableChanged(),
    tapLog('AppUsersService appUsers$', 'warn'), // TODO: remove
    cacheUntil(this.destroyed$)
  );

  public readonly appUserById$ = this.appUsers$.pipe(
    mapLoaded(appUsers => recordBy(appUsers, ({id}) => id)),
    cacheUntil(this.destroyed$)
  );
  public readonly selectAppUserById = memoize((id: string) => {
    return this.appUserById$.pipe(
      pluckLoaded(id),
      distinctUntilLoadableChanged()
    );
  });

  private readonly appUserByEmail$ = this.appUsers$.pipe(
    mapLoaded(appUsers => recordBy(appUsers, ({email}) => email)),
    cacheUntil(this.destroyed$)
  );
  public readonly selectAppUserByEmail = memoize((email: string) => {
    return this.appUserByEmail$.pipe(
      pluckLoaded(email),
      distinctUntilLoadableChanged()
    );
  });

  private readonly sessionAppUserEmailConfirmationUrlById$ = new BehaviorSubject(partialRecord<string, string>());
  public readonly selectSessionAppUserEmailConfirmationUrlById = memoize((appUserId: string) => {
    return this.sessionAppUserEmailConfirmationUrlById$.pipe(
      pluck(appUserId),
      distinctUntilChanged()
    );
  });

  public create({email, name, appRoles}: {
    email: string;
    name: string;
    appRoles: AppRole[];
  }) {
    return this.ongoingModifications.incrementWhile(async () => {
      const {
        newAppUserId,
        emailConfirmationUrl
      } = await firstValueFrom(this.httpCreate({
        email,
        name,
        appRoles
      }));

      produceBehaviorSubjectMutable(
        this.sessionAppUserEmailConfirmationUrlById$,
        sessionAppUserEmailConfirmationUrlById => {
          sessionAppUserEmailConfirmationUrlById[newAppUserId] = emailConfirmationUrl;
        }
      );

      return {newAppUserId};
    });
  }

  public update({appUserId, name, lockedOut, appRoles}: {
    appUserId: string;
    name: string;
    lockedOut: boolean;
    appRoles: AppRole[];
  }) {
    return this.ongoingModifications.incrementWhile(async () => {
      await firstValueFrom(this.httpUpdate(appUserId, {
        name,
        lockedOut,
        appRoles
      }));
    });
  }

  public delete(appUserId: string) {
    return this.ongoingModifications.incrementWhile(async () => {
      await firstValueFrom(this.httpDelete(appUserId));
    });
  }

  public async resendEmailConfirmation(appUserId: string) {
    const {emailConfirmationUrl} = await firstValueFrom(this.httpResendEmailConfirmation(appUserId));

    produceBehaviorSubjectMutable(
      this.sessionAppUserEmailConfirmationUrlById$,
      sessionAppUserEmailConfirmationUrlById => {
        sessionAppUserEmailConfirmationUrlById[appUserId] = emailConfirmationUrl;
      }
    );
  }

  public async removePassword(appUserId: string){
    return this.ongoingModifications.incrementWhile(async () => {
      await firstValueFrom(this.httpRemovePassword(appUserId));
    });
  }

  private httpGetAll() {
    const url = this.baseUrl;
    return this.http.get<OtherAppUserDto[]>(url).pipe(
      retryWhen(errors => errors.pipe(delay(2500)))
    );
  }

  private httpCreate(request: {
    email: string;
    name: string;
    appRoles: AppRole[];
  }) {
    const url = this.baseUrl;
    return this.http.post<{
      newAppUserId: string;
      emailConfirmationUrl: string;
    }>(url, request);
  }

  private httpUpdate(appUserId: string, request: {
    name: string;
    lockedOut: boolean;
    appRoles: AppRole[];
  }) {
    const url = `${this.baseUrl}/${encodeURIComponent(appUserId)}`;
    return this.http.put<void>(url, request);
  }

  private httpDelete(appUserId: string) {
    const url = `${this.baseUrl}/${encodeURIComponent(appUserId)}`;
    return this.http.delete<void>(url);
  }

  private httpResendEmailConfirmation(appUserId: string) {
    const url = `${this.baseUrl}/${encodeURIComponent(appUserId)}/ResendEmailConfirmation`;
    return this.http.post<{
      emailConfirmationUrl: string;
    }>(url, null);
  }

  private httpRemovePassword(appUserId: string) {
    const url = `${this.baseUrl}/${encodeURIComponent(appUserId)}/Password`;
    return this.http.delete<void>(url);
  }
}
