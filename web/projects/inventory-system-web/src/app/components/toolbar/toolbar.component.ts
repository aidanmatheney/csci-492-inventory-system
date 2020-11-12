import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {map} from 'rxjs/operators';

import {CurrentUserService} from '../../services/current-user.service';

@Component({
  selector: 'inventory-system-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit {
  public readonly signedIn$ = this.currentUserService.signedIn$.pipe(map(({loading, signedIn}) => {
    return !loading && signedIn;
  }));

  public constructor(
    private readonly currentUserService: CurrentUserService
  ) { }

  public ngOnInit() { }
}
