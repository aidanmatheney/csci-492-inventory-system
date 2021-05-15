import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../../services/page-title.service';

import {DashboardShortcut} from '../../../../models/ui';

@Component({
  selector: 'inventory-system-secretary-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecretaryDashboardComponent implements OnInit {
  public readonly inventoryShortcuts: readonly DashboardShortcut[] = [
    {title: 'Inventory', icon: 'keyboard', link: 'inventory'},
    {title: 'Create Inventory Item', icon: 'add_circle', link: 'inventory/create'},
    {title: 'Inventory Changes', icon: 'change_history', link: 'inventory/changes'},
    {title: 'Inventory Assignees', icon: 'group', link: 'inventory/assignees'},
    {title: 'Create Inventory Assignee', icon: 'add_circle', link: 'inventory/assignees/create'}
  ];

  public readonly reportsShortcuts: readonly DashboardShortcut[] = [
    {title: 'Reports', icon: 'notes', link: 'reports'}
  ];

  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Dashboard');
  }
}
