import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {CurrentAppUserService} from '../../services/current-app-user.service';

@Component({
  selector: 'inventory-system-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public readonly signedIn$ = this.currentAppUserService.signedIn$;

  public constructor(
    private readonly currentAppUserService: CurrentAppUserService
  ) { }

  public ngOnInit() { }
}
