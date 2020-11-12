import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {v4 as uuid} from 'uuid';

import {timeoutPromise} from '../utils/promise';

import {StatefulService} from './stateful.service';
import {Destroyed$} from './destroyed$.service';

const authenticationLocalStorageKey = 'authentication';
interface StoredAuthenticationData {
  version: '1';
  token?: string;
}

interface AuthenticationServiceState {
  token?: string;
}

@Injectable({providedIn: 'root'})
export class AuthenticationService extends StatefulService<AuthenticationServiceState> {
  public constructor(
    private readonly router: Router,
    private readonly destroyed$: Destroyed$
  ) {
    super({});

    this.loadStoredData();
    this.state$.pipe(takeUntil(this.destroyed$)).subscribe(state => this.syncStateToStorage(state));
  }

  public readonly token$ = this.select(state => state.token);

  public signIn(returnUrl?: string) {
    console.error('AuthenticationService signIn', {returnUrl});

    // TODO: redirect to the server's sign-in page, which will redirect back to /sign-in-callback with a token after
    // the user signs in
    (async () => {
      await timeoutPromise(2500);

      await this.router.navigate(['/sign-in-callback'], {queryParams: {
        token: uuid(),
        returnUrl
      }});
    })();
  }

  public handleSignInSuccess(token: string) {
    this.update(state => state.token = token);
  }

  private loadStoredData() {
    const dataJson = localStorage.getItem(authenticationLocalStorageKey);
    if (dataJson == null) {
      return;
    }

    const data = JSON.parse(dataJson) as StoredAuthenticationData;
    this.update(state => state.token = data.token);
  }

  private syncStateToStorage(state: AuthenticationServiceState) {
    const data: StoredAuthenticationData = {
      version: '1',
      token: state.token
    };
    const dataJson = JSON.stringify(data);
    localStorage.setItem(authenticationLocalStorageKey, dataJson);
  }
}
