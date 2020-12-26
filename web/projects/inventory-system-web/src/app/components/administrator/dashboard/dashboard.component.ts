import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../services/page-title.service';

@Component({
  selector: 'inventory-system-administrator-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministratorDashboardComponent implements OnInit {
  public readonly usersShortcuts: ReadonlyArray<{title: string; link: string;}> = [
    {title: 'Manage', link: 'users'},
    {title: 'Create', link: 'users/create'}
  ];

  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Admin Dashboard');
  }
}
