import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../services/page-title.service';

import {DashboardShortcut} from '../../../models/ui';

@Component({
  selector: 'inventory-system-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  public readonly shortcuts: readonly DashboardShortcut[] = [
    {title: 'Appearance', icon: 'color_lens', link: 'appearance'},
    {title: 'Security', icon: 'security', link: 'security'}
  ];

  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Settings');
  }
}
