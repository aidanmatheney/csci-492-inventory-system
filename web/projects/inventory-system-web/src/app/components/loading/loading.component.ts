import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'inventory-system-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent implements OnInit {
  @Input() public color: ThemePalette = 'primary';
  @Input() public diameter = 25;

  public constructor() { }

  public ngOnInit() { }
}
