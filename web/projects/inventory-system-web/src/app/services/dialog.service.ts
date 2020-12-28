import {Injectable} from '@angular/core';
import {MatDialog as MatDialogService} from '@angular/material/dialog';

import {firstValueFrom} from '../utils/observable';

import {ConfirmDialogComponent} from '../components/dialogs/confirm/confirm-dialog.component';
import {ConfirmDialogOptions} from '../components/dialogs/confirm/model';

@Injectable({providedIn: 'root'})
export class DialogService {
  public constructor(
    private readonly matDialogService: MatDialogService
  ) { }

  public async confirm(options?: ConfirmDialogOptions) {
    const dialogRef = this.matDialogService.open<
      ConfirmDialogComponent,
      ConfirmDialogOptions,
      boolean
    >(ConfirmDialogComponent, {data: options});

    const confirmed = (await firstValueFrom(dialogRef.afterClosed())) ?? false;
    return confirmed;
  }
}
