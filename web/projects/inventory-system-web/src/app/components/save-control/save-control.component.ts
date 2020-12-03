import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {FormControlsValue, selectFormDirty, selectFormValid} from '../../utils/form';
import {ProcessingState} from '../../utils/processing';

@Component({
  selector: 'inventory-system-save-control[form][initialFormValue]',
  templateUrl: './save-control.component.html',
  styleUrls: ['./save-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveControlComponent<TFormControls extends object, TFormErrors extends object> implements OnInit {
  private readonly form$ = new BehaviorSubject<FormGroup<TFormControls, TFormErrors>>(undefined!);
  @Input() public set form(value: FormGroup<TFormControls, TFormErrors>) {
    this.form$.next(value);
  }
  private readonly initialFormValue$ = new BehaviorSubject<FormControlsValue<TFormControls>>(undefined!);
  @Input() public set initialFormValue(value: FormControlsValue<TFormControls>) {
    this.initialFormValue$.next(value);
  }

  @Input() public showSave = true;
  public readonly forceDisableSave$ = new BehaviorSubject(false);
  @Input() public set forceDisableSave(value: boolean) {
    this.forceDisableSave$.next(value);
  }
  @Input() public saveText = 'Save';
  public readonly saveState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);
  @Input() public set saveState(value: ProcessingState) {
    this.saveState$.next(value);
  }

  @Input() public showDelete = false;
  public readonly forceDisableDelete$ = new BehaviorSubject(false);
  @Input() public set forceDisableDelete(value: boolean) {
    this.forceDisableDelete$.next(value);
  }
  @Input() public deleteText = 'Delete';
  public readonly deleteState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);
  @Input() public set deleteState(value: ProcessingState) {
    this.deleteState$.next(value);
  }

  @Output() public readonly save = new EventEmitter<void>();
  @Output() public readonly delete = new EventEmitter<void>();

  public readonly formDirty$ = this.form$.pipe(switchMap(form => selectFormDirty(form, this.initialFormValue$)));
  public readonly formValid$ = this.form$.pipe(switchMap(form => selectFormValid(form)));

  public readonly saveProcessing$ = this.saveState$.pipe(map(ProcessingState.isStarted));
  public readonly deleteProcessing$ = this.deleteState$.pipe(map(ProcessingState.isStarted));

  public readonly saveEnabled$ = combineLatest([
    this.forceDisableSave$,
    this.saveProcessing$,
    this.deleteProcessing$,
    this.formDirty$,
    this.formValid$
  ]).pipe(
    map(([forceDisableSave, saveProcessing, deleteProcessing, formDirty, formValid]) => (
      !forceDisableSave
      && !saveProcessing
      && !deleteProcessing
      && formDirty
      && formValid
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
