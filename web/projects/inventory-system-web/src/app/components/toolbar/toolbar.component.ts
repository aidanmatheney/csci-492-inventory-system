import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {map} from 'rxjs/operators';

import {AuthenticationService} from '../../services/authentication.service';
import {CurrentAppUserService} from '../../services/current-app-user.service';

import {environment} from 'projects/inventory-system-web/src/environments/environment';

@Component({
  selector: 'inventory-system-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit {
  public readonly loading$ = this.currentAppUserService.loading$;
  public readonly signedIn$ = this.currentAppUserService.signedIn$.pipe(map(({loading, signedIn}) => {
    return !loading && signedIn;
  }));
  public readonly currentAppUserEmail$ = this.currentAppUserService.appUser$.pipe(map(({loading, appUser}) => {
    return loading ? undefined : appUser?.email;
  }));

  public readonly manageAccountUrl = `${environment.serverBaseUrl}/Identity/Account/Manage`;

  public constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly currentAppUserService: CurrentAppUserService
  ) { }

  public ngOnInit() { }

  public signIn() {
    this.authenticationService.signIn();
  }

  public signOut() {
    this.authenticationService.signOut();
  }
}
