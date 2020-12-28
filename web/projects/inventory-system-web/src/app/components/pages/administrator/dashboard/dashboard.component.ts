import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../../services/page-title.service';

import {MatIconName} from '../../../../models/mat-icon';

@Component({
  selector: 'inventory-system-administrator-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministratorDashboardComponent implements OnInit {
  public readonly usersShortcuts: ReadonlyArray<{
    title: string;
    icon: MatIconName;
    link: string;
  }> = [
    {title: 'Users', icon: 'people', link: 'users'},
    {title: 'Create User', icon: 'person_add', link: 'users/create'}
  ];

  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Admin Dashboard');
  }
}
