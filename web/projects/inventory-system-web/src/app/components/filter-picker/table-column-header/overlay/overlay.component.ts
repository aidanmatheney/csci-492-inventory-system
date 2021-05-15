import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {FormControl} from '@ngneat/reactive-forms';
import {BehaviorSubject} from 'rxjs';

import {FilterPickerComponent} from '../../filter-picker.component';
import {
  ArgumentsByFilterNameAndDataType,
  DataTypeByFilterName,
  FilterName,
  FormValueByFilterNameAndDataType
} from '../../model';

@Component({
  selector: 'inventory-system-filter-picker-table-column-header-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPickerTableColumnHeaderOverlayComponent<
  TFilterName extends FilterName,
  TDataType extends DataTypeByFilterName<TFilterName>
> implements OnInit, AfterViewInit {
  @ViewChild('filterPicker') public filterPicker!: FilterPickerComponent<TFilterName, TDataType>;

  @Input() public filter!: TFilterName;
  @Input() public dataType!: TDataType;
  @Input() public args!: ArgumentsByFilterNameAndDataType<TFilterName, TDataType>;
  @Input() public form!: FormControl<FormValueByFilterNameAndDataType<TFilterName, TDataType>>;

  @Output() public readonly submit = new EventEmitter<void>();

  public readonly viewInitialized$ = new BehaviorSubject(false);

  public constructor() { }

  public ngOnInit() { }

  public ngAfterViewInit() {
    this.viewInitialized$.next(true);
  }

  public focusFirstInput() {
    this.filterPicker.focusFirstInput();
  }
}
