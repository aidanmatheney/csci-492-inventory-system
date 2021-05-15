import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../../services/page-title.service';

import {DashboardShortcut} from '../../../../models/ui';

@Component({
  selector: 'inventory-system-administrator-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministratorDashboardComponent implements OnInit {
  public readonly usersShortcuts: readonly DashboardShortcut[] = [
    {title: 'Users', icon: 'people', link: 'users'},
    {title: 'Create User', icon: 'person_add', link: 'users/create'}
  ];

  public readonly logsShortcuts: readonly DashboardShortcut[] = [
    {title: 'Server Logs', icon: 'dns', link: 'logs/server'}
  ];

  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Admin Dashboard');
  }
}
