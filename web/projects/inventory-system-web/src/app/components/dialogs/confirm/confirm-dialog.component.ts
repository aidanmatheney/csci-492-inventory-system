import {Component, OnInit, ChangeDetectionStrategy, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {CustomFormErrors, fixValidatorType, selectFormValid} from '../../../utils/form';

import {ConfirmDialogOptions} from './model';

type ConfirmDialogForm = FormGroup<{
  confirmationText: FormControl<string, CustomFormErrors<'required' | 'invalid'>>;
}, {}>;

@Component({
  selector: 'inventory-system-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent implements OnInit {
  public readonly requiredConfirmationText = this.options?.requireInputToConfirm;
  public readonly hasRequiredConfirmationText = (
    this.requiredConfirmationText != null
    && this.requiredConfirmationText != ''
  );

  public readonly form: ConfirmDialogForm = this.formBuilder.group({
    confirmationText: this.formBuilder.control('', {
      validators: [fixValidatorType(this.validateConfirmationText.bind(this))]
    })
  });

  public readonly confirmEnabled$ = selectFormValid(this.form);

  public constructor(
    @Inject(MAT_DIALOG_DATA) public readonly options: ConfirmDialogOptions | null | undefined,
    private readonly formBuilder: FormBuilder
  ) { }

  public ngOnInit() { }

  private validateConfirmationText(
    confirmationTextFormControl: ConfirmDialogForm['controls']['confirmationText']
  ): ConfirmDialogForm['controls']['confirmationText']['errors'] | null {
    const confirmationText = confirmationTextFormControl.value;

    if (!this.hasRequiredConfirmationText) {
      return null;
    }

    if (confirmationText === '') {
      return {required: true};
    }
    if (confirmationText !== this.requiredConfirmationText) {
      return {invalid: true};
    }

    return null;
  }
}
