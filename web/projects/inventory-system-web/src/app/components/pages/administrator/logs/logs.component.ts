import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../../services/page-title.service';

import {DashboardShortcut} from '../../../../models/ui';

@Component({
  selector: 'inventory-system-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsComponent implements OnInit {
  public readonly shortcuts: readonly DashboardShortcut[] = [
    {title: 'Server', icon: 'dns', link: 'server'}
  ];

  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Logs');
  }
}
