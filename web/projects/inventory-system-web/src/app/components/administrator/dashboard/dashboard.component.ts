import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'inventory-system-administrator-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministratorDashboardComponent implements OnInit {
  public readonly usersShortcuts: ReadonlyArray<{title: string; link: string;}> = [
    {title: 'Manage', link: './users'},
    {title: 'Create', link: './users/create'}
  ];

  public constructor() { }

  public ngOnInit() { }
}
