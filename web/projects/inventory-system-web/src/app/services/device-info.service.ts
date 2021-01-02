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

  public readonly hasNarrowViewport$ = this.breakpointObserver.observe('(max-width: 720px)').pipe(
    pluck('matches'),
    cacheUntil(this.destroyed$)
  );

  public readonly prefersLightColorScheme$ = this.breakpointObserver.observe('(prefers-color-scheme: light)').pipe(
    pluck('matches'),
    cacheUntil(this.destroyed$)
  );
}
