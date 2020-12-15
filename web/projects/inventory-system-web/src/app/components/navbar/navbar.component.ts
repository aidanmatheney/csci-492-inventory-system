import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {mapLoadable, selectLoading} from "../../utils/loading";

import {AuthenticationService} from '../../services/authentication.service';
import {CurrentAppUserService} from '../../services/current-app-user.service';

@Component({
  selector: 'inventory-system-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  public readonly loading$ = selectLoading(this.currentAppUserService.appUser$);
  public readonly signedIn$ = this.currentAppUserService.signedIn$.pipe(mapLoadable<boolean>(false));
  public readonly currentAppUserEmail$ = this.currentAppUserService.appUser$.pipe(
    mapLoadable(undefined, appUser => appUser?.email)
  );
  public readonly isSecretary$ = this.currentAppUserService.isSecretary$.pipe(mapLoadable<boolean>(false));
  public readonly isAdministrator$ = this.currentAppUserService.isAdministrator$.pipe(mapLoadable<boolean>(false));

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
