import {ThemePalette} from '@angular/material/core';

export interface ConfirmDialogOptions {
  title?: string;
  body?: string;
  requireInputToConfirm?: string;
  cancelButton?: {
    text?: string;
  };
  confirmButton?: {
    text?: string;
    color?: ThemePalette;
  };
}
