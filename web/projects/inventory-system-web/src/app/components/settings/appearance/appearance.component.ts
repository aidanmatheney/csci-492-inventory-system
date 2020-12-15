import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {AppearanceService} from '../../../services/appearance.service';

import {AppTheme} from '../../../models/app-user-settings';

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
    private readonly appearanceService: AppearanceService
  ) { }

  public ngOnInit() { }

  public setAppTheme(theme: AppTheme) {
    this.appearanceService.setAppTheme(theme);
  }
}
