import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {isObservable, Observable} from 'rxjs';

import {firstValueFrom} from '../utils/observable';

import {DialogService} from '../services/dialog.service';

export interface SaveablePage {
  readonly dirty$: Observable<boolean>;
}
const isSaveablePage = (component: Partial<SaveablePage>): component is SaveablePage => isObservable(component.dirty$);

@Injectable({providedIn: 'root'})
export class UnsavedPageChangesGuard implements CanDeactivate<SaveablePage> {
  public constructor(
    private readonly dialogService: DialogService
  ) { }

  public async canDeactivate(
    component: SaveablePage,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ) {
    if (!isSaveablePage(component)) {
      throw new Error('Component must implement SaveablePage');
    }

    const dirty = await firstValueFrom(component.dirty$);
    if (!dirty) {
      return true;
    }

    const confirmed = await this.dialogService.confirm({
      title: 'Unsaved Changes',
      body: 'You have unsaved changes. Are you sure you wish to leave without saving?',
      cancelButton: {text: 'Stay'},
      confirmButton: {text: 'Leave', color: 'warn'}
    });
    return confirmed;
  }
}
