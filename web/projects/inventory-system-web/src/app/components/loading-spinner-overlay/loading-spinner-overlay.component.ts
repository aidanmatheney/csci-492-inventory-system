import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'inventory-system-loading-spinner-overlay[loading]',
  templateUrl: './loading-spinner-overlay.component.html',
  styleUrls: ['./loading-spinner-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerOverlayComponent implements OnInit {
  public readonly loading$ = new BehaviorSubject<boolean>(undefined!);
  @Input() public set loading(value: boolean) {
    this.loading$.next(value);
  }

  public constructor() { }

  public ngOnInit() { }
}
