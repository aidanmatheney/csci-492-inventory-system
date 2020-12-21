import {Observable} from 'rxjs';

export const confirmUnsavedChangesBeforeUnload = (dirty$: Observable<boolean>) => {
  const message = 'You have unsaved changes. Are you sure you wish to leave without saving?';

  let dirty = false;
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!dirty) {
      return undefined;
    }

    event.preventDefault();
    event.returnValue = message;
    return message;
  };
  addEventListener('beforeunload', handleBeforeUnload);

  dirty$.subscribe({
    next: nextDirty => dirty = nextDirty,
    complete: () => removeEventListener('beforeunload', handleBeforeUnload)
  });
};
