import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {ThemePalette} from '@angular/material/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';

import {ProcessingState} from '../../utils/processing';

@Component({
  selector: 'inventory-system-processing-control[state][text]',
  templateUrl: './processing-control.component.html',
  styleUrls: ['./processing-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessingControlComponent implements OnInit {
  public static ngAcceptInputType_forceDisable: BooleanInput;

  private readonly state$ = new BehaviorSubject<ProcessingState>(undefined!);
  @Input() public set state(value: ProcessingState) {
    this.state$.next(value);
  }

  @Input() public text!: string;
  @Input() public color: ThemePalette = 'primary';

  private readonly forceDisable$ = new BehaviorSubject(false);
  @Input() public set forceDisable(value: boolean) {
    this.forceDisable$.next(coerceBooleanProperty(value));
  }

  @Output() public readonly process = new EventEmitter<void>();

  public readonly processing$ = this.state$.pipe(map(ProcessingState.isStarted));
  public readonly enabled$ = combineLatest([
    this.processing$,
    this.forceDisable$
  ]).pipe(
    map(([processing, forceDisable]) => !processing && !forceDisable)
  );

  public constructor() { }

  public ngOnInit() { }
}
