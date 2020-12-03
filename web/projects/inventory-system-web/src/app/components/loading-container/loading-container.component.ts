import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'inventory-system-loading-container[loading]',
  templateUrl: './loading-container.component.html',
  styleUrls: ['./loading-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingContainerComponent implements OnInit {
  public readonly loading$ = new BehaviorSubject<boolean>(undefined!);
  @Input() public set loading(value: boolean | '' | null) {
    this.loading$.next(value === '' ? true : (value ?? true));
  }

  public constructor() { }

  public ngOnInit() { }
}
