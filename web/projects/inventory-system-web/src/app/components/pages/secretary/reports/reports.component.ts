import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { FormBuilder, FormControl, FormGroup } from '@ngneat/reactive-forms';
import { BehaviorSubject, of } from 'rxjs';

import { AngularFormErrors, FormValue, selectFormDirty, selectFormValid } from '../../../../utils/form';
import { ProcessingState } from '../../../../utils/processing';
import { cacheUntil } from '../../../../utils/observable';
import { confirmUnsavedChangesBeforeUnload } from '../../../../utils/confirm';
import { selectLoading } from '../../../../utils/loading';

import { PageTitleService } from '../../../../services/page-title.service';
import { InventoryService } from '../../../../services/inventory.service';
import { Destroyed$ } from '../../../../services/destroyed$.service';

import { SaveablePage } from '../../../../guards/unsaved-page-changes.guard';


type GenerateReportForm = FormGroup<{
  item: FormControl<string>;
  assignee: FormControl<string>;
  checkedOut: FormControl<string>;
}, {}>;
type GenerateReportFormValue = FormValue<GenerateReportForm>;

@Component({
  selector: 'inventory-system-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit, SaveablePage {
  public readonly loading$ = selectLoading(this.inventoryService.itemHistories$);

  public readonly form: GenerateReportForm = this.formBuilder.group({
    item: this.formBuilder.control(''),
    assignee: this.formBuilder.control(''),
    checkedOut: this.formBuilder.control('')
  });
  public readonly initialFormValue: GenerateReportFormValue = {
    item: '',
    assignee: '',
    checkedOut: ''
  };
  public readonly formDirty$ = selectFormDirty(this.form, of(this.initialFormValue)).pipe(cacheUntil(this.destroyed$));
  public readonly formValid$ = selectFormValid(this.form);

  public readonly dirty$ = this.formDirty$;

  public readonly createState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly inventoryService: InventoryService,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Reports');

    confirmUnsavedChangesBeforeUnload(this.dirty$);
  }

  public async create() {
    this.createState$.next(ProcessingState.started);

    const {
      item,
      assignee
    } = this.form.value;

    
  }
}
