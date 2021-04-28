import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {mapLoadable, selectLoading} from '../../../utils/loading';

import {CurrentAppUserService} from '../../../services/current-app-user.service';

@Component({
  selector: 'inventory-system-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public readonly signedIn$ = this.currentAppUserService.signedIn$.pipe(mapLoadable<boolean>(false));
  public readonly isSecretary$ = this.currentAppUserService.isSecretary$.pipe(mapLoadable<boolean>(false));
  public readonly loading$ = selectLoading(this.currentAppUserService.appUser$);

  public constructor(
    private readonly currentAppUserService: CurrentAppUserService
  ) { }

  public ngOnInit() { }
}
