import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'inventory-system-spinner-button-container[spin]',
  templateUrl: './spinner-button-container.component.html',
  styleUrls: ['./spinner-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerButtonContainerComponent implements OnInit {
  @Input() public spin!: boolean;
  @Input() public spinnerColor: ThemePalette = 'accent';

  public constructor() { }

  public ngOnInit() { }
}
