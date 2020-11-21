import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'inventory-system-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpComponent implements OnInit {
  public constructor() { }

  public ngOnInit() { }
}
