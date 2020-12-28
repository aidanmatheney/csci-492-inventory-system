import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../../services/page-title.service';
import {AppearanceService} from '../../../../services/appearance.service';

import {AppTheme} from '../../../../models/app-user-settings';

@Component({
  selector: 'inventory-system-appearance-settings',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppearanceSettingsComponent implements OnInit {
  public readonly currentAppTheme$ = this.appearanceService.appTheme$;

  public readonly AppTheme = AppTheme;

  public constructor(
    private readonly pageTitleService: PageTitleService,
    private readonly appearanceService: AppearanceService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Appearance Settings');
  }

  public setAppTheme(theme: AppTheme) {
    this.appearanceService.setAppTheme(theme);
  }
}
