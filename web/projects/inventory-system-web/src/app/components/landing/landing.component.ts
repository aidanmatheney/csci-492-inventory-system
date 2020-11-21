import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'inventory-system-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit {
  public constructor() { }

  public ngOnInit() { }
}
