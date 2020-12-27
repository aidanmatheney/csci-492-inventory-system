import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'inventory-system-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent implements OnInit {
  @Input() public color: ThemePalette = 'primary';
  @Input() public diameter = 25;

  public constructor() { }

  public ngOnInit() { }
}
