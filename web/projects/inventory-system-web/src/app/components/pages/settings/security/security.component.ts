import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../../services/page-title.service';

import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'inventory-system-security-settings',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySettingsComponent implements OnInit {
  public readonly changePasswordUrl = `${environment.serverBaseUrl}/Identity/Account/Manage/ChangePassword`;

  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Security Settings');
  }
}
