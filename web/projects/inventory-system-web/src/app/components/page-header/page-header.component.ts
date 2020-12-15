import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'inventory-system-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent implements OnInit {
  public constructor() { }

  public ngOnInit() { }
}
