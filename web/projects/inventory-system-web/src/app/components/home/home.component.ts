import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {CurrentUserService} from '../../services/current-user.service';

@Component({
  selector: 'inventory-system-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public readonly signedIn$ = this.currentUserService.signedIn$;

  public constructor(
    private readonly currentUserService: CurrentUserService
  ) { }

  public ngOnInit() { }
}
