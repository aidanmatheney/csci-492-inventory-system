import {Injectable} from '@angular/core';
import {distinctUntilChanged, pluck} from 'rxjs/operators';

import {cacheUntil, firstValueFrom} from '../utils/observable';

import {CurrentAppUserService} from './current-app-user.service';
import {Destroyed$} from './destroyed$.service';

import {AppTheme} from '../models/app-user-settings';

@Injectable({providedIn: 'root'})
export class AppearanceService {
  public constructor(
    private readonly currentAppUserService: CurrentAppUserService,
    private readonly destroyed$: Destroyed$
  ) { }

  public readonly appTheme$ = this.currentAppUserService.settings$.pipe(
    pluck('theme'),
    distinctUntilChanged(),
    cacheUntil(this.destroyed$)
  );

  public async setAppTheme(theme: AppTheme | undefined) {
    const settings = await firstValueFrom(this.currentAppUserService.settings$);
    this.currentAppUserService.setSettings({...settings, theme});
  }
}
