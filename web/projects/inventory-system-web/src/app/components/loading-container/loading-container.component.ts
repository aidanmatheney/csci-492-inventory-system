import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'inventory-system-loading-container[loading]',
  templateUrl: './loading-container.component.html',
  styleUrls: ['./loading-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingContainerComponent implements OnInit {
  public static ngAcceptInputType_loading: BooleanInput;

  public readonly loading$ = new BehaviorSubject<boolean>(undefined!);
  @Input() public set loading(value: boolean) {
    this.loading$.next(coerceBooleanProperty(value));
  }

  public constructor() { }

  public ngOnInit() { }
}
