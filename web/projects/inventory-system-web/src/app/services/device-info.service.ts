import {Injectable} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {pluck} from 'rxjs/operators';

import {cacheUntil} from '../utils/observable';

import {Destroyed$} from './destroyed$.service';

@Injectable({providedIn: 'root'})
export class DeviceInfoService {
  public constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly destroyed$: Destroyed$
  ) { }

  public readonly hasNarrowViewport$ = this.selectMediaQueryMatches('(max-width: 720px)');
  public readonly prefersLightColorScheme$ = this.selectMediaQueryMatches('(prefers-color-scheme: light)');

  private selectMediaQueryMatches(...queries: readonly string[]) {
    return this.breakpointObserver.observe(queries).pipe(
      pluck('matches'),
      cacheUntil(this.destroyed$)
    );
  }
}
