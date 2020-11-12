import {Component} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {filter, map} from 'rxjs/operators';

@Component({
  selector: 'inventory-system-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public readonly loading$ = this.router.events.pipe(
    filter((event): event is (
      | NavigationStart
      | NavigationEnd
      | NavigationCancel
      | NavigationError
    ) => (
      event instanceof NavigationStart
      || event instanceof NavigationEnd
      || event instanceof NavigationCancel
      || event instanceof NavigationError
    )),
    map(event => event instanceof NavigationStart)
  );

  public constructor(
    private readonly router: Router
  ) { }
}
