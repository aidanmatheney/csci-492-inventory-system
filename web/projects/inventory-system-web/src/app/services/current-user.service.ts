import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, switchMap, takeUntil} from 'rxjs/operators';

import {PartialRecordSet} from '../utils/record';
import {partialRecordSet} from '../utils/array';
import {timeoutPromise} from '../utils/promise';

import {StatefulService} from './stateful.service';
import {AuthenticationService} from './authentication.service';
import {Destroyed$} from './destroyed$.service';

import {User, UserPermission} from '../models/user';

@Injectable({providedIn: 'root'})
export class CurrentUserService extends StatefulService<{
  loading: boolean;
  user: User | undefined;
  permissions: PartialRecordSet<UserPermission> | undefined;
}> {
  public constructor(
    private readonly http: HttpClient,
    private readonly authenticationService: AuthenticationService,
    private readonly destroyed$: Destroyed$
  ) {
    super({
      loading: false,
      user: undefined,
      permissions: undefined
    });

    this.authenticationService.token$.pipe(
      switchMap(async token => {
        if (token == null) {
          console.error('CurrentUserService token: token is null, returning null user&permissions', {});
          return {
            user: undefined,
            permissions: undefined
          };
        }

        console.error('CurrentUserService token: have token, setting loading & fetching', {token});
        this.update(state => state.loading = true);
        return await this.fetchUserInformation(token);
      }),
      takeUntil(this.destroyed$)
    ).subscribe(({user, permissions}) => {
      console.error('CurrentUserService token: got data', {user, permissions});
      this.update(state => {
        state.loading = false;
        state.user = user;
        state.permissions = permissions && partialRecordSet(permissions);
      });
    });
  }

  public readonly loading$ = this.select(({loading}) => loading);

  public readonly user$ = this.select(({loading, user}) => ({loading, user}));
  public readonly signedIn$ = this.select(({loading, user}) => ({loading, signedIn: user != null}));

  public selectHasPermission(permission: UserPermission) {
    return this.select(({loading, permissions}) => ({loading, permissions})).pipe(
      map(({loading, permissions}) => ({loading, hasPermission: permissions?.[permission] ?? false}))
    );
  }
  public readonly isSecretary$ = this.selectHasPermission(UserPermission.Secretary);
  public readonly isAdministrator$ = this.selectHasPermission(UserPermission.Administrator);

  private async fetchUserInformation(token: string) {
    // TODO: actually fetch from server

    await timeoutPromise(1000);

    return {
      user: {
        email: 'user@email.com',
        name: 'First Last'
      },
      permissions: [
        UserPermission.Secretary,
        UserPermission.Administrator
      ]
    };
  }
}
