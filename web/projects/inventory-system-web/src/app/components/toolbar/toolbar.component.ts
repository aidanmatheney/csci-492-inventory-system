import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {mapLoadable, selectLoading} from "../../utils/loading";

import {AuthenticationService} from '../../services/authentication.service';
import {CurrentAppUserService} from '../../services/current-app-user.service';

import {environment} from '../../../environments/environment';

@Component({
  selector: 'inventory-system-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit {
  public readonly loading$ = selectLoading(this.currentAppUserService.appUser$);
  public readonly signedIn$ = this.currentAppUserService.signedIn$.pipe(mapLoadable<boolean>(false));
  public readonly currentAppUserEmail$ = this.currentAppUserService.appUser$.pipe(
    mapLoadable(undefined, appUser => appUser?.email)
  );
  public readonly isSecretary$ = this.currentAppUserService.isSecretary$.pipe(mapLoadable<boolean>(false));
  public readonly isAdministrator$ = this.currentAppUserService.isAdministrator$.pipe(mapLoadable<boolean>(false));

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
