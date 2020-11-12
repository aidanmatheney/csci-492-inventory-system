import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'inventory-system-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit {
  public constructor(
    private readonly route: ActivatedRoute,
    private readonly authenticationService: AuthenticationService
  ) { }

  public ngOnInit() { }

  public signIn() {
    const {returnUrl} = this.route.snapshot.queryParams as {
      returnUrl?: string;
    };
    this.authenticationService.signIn(returnUrl);
  }
}
