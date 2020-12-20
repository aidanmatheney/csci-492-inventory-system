import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';

import {ProcessingState} from '../../utils/processing';

@Component({
  selector: 'inventory-system-save-control[dirty][valid]',
  templateUrl: './save-control.component.html',
  styleUrls: ['./save-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveControlComponent<TFormControls extends object, TFormErrors extends object> implements OnInit {
  public static ngAcceptInputType_forceDisableSave: BooleanInput;
  public static ngAcceptInputType_forceDisableDelete: BooleanInput;

  private readonly dirty$ = new BehaviorSubject<boolean>(undefined!);
  @Input() public set dirty(value: boolean) {
    this.dirty$.next(value);
  }
  private readonly valid$ = new BehaviorSubject<boolean>(undefined!);
  @Input() public set valid(value: boolean) {
    this.valid$.next(value);
  }

  @Input() public showSave = true;
  public readonly forceDisableSave$ = new BehaviorSubject(false);
  @Input() public set forceDisableSave(value: boolean) {
    this.forceDisableSave$.next(coerceBooleanProperty(value));
  }
  @Input() public saveText = 'Save';
  public readonly saveState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);
  @Input() public set saveState(value: ProcessingState) {
    this.saveState$.next(value);
  }

  @Input() public showDelete = false;
  public readonly forceDisableDelete$ = new BehaviorSubject(false);
  @Input() public set forceDisableDelete(value: boolean) {
    this.forceDisableDelete$.next(coerceBooleanProperty(value));
  }
  @Input() public deleteText = 'Delete';
  public readonly deleteState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);
  @Input() public set deleteState(value: ProcessingState) {
    this.deleteState$.next(value);
  }

  @Output() public readonly save = new EventEmitter<void>();
  @Output() public readonly delete = new EventEmitter<void>();

  public readonly saveProcessing$ = this.saveState$.pipe(map(ProcessingState.isStarted));
  public readonly deleteProcessing$ = this.deleteState$.pipe(map(ProcessingState.isStarted));

  public readonly saveEnabled$ = combineLatest([
    this.forceDisableSave$,
    this.saveProcessing$,
    this.deleteProcessing$,
    this.dirty$,
    this.valid$
  ]).pipe(
    map(([forceDisableSave, saveProcessing, deleteProcessing, dirty, valid]) => (
      !forceDisableSave
      && !saveProcessing
      && !deleteProcessing
      && dirty
      && valid
    ))
  );
  public readonly deleteEnabled$ = combineLatest([
    this.forceDisableDelete$,
    this.saveProcessing$,
    this.deleteProcessing$
  ]).pipe(
    map(([forceDisableDelete, saveProcessing, deleteProcessing]) => (
      !forceDisableDelete
      && !saveProcessing
      && !deleteProcessing
    ))
  );

  public constructor() { }

  public ngOnInit() { }
}
