import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'inventory-system-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  public readonly settingsPages: ReadonlyArray<{title: string; link: string;}> = [
    {title: 'Appearance', link: 'appearance'},
    {title: 'Security', link: 'security'}
  ];

  public constructor() { }

  public ngOnInit() { }
}
