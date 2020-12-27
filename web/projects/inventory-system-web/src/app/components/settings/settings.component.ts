import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {MatIconName} from '../../models/mat-icon';

@Component({
  selector: 'inventory-system-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  public readonly shortcuts: ReadonlyArray<{
    title: string;
    icon: MatIconName;
    link: string;
  }> = [
    {title: 'Appearance', icon: 'color_lens', link: 'appearance'},
    {title: 'Security', icon: 'security', link: 'security'}
  ];

  public constructor() { }

  public ngOnInit() { }
}
