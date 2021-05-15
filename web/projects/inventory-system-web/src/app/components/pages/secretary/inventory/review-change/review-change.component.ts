import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {MatTableDataSource} from '@angular/material/table';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {filter, map, pluck, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {isEqual as datesEqual} from 'date-fns';

import {Loadable, selectInitialLoading, selectLoadedValue, switchMapLoadable} from '../../../../../utils/loading';
import {cacheUntil, firstValueFrom} from '../../../../../utils/observable';
import {isNotFalse, isNotNull, isNull, someTrue} from '../../../../../utils/filter';
import {stringToNumber} from '../../../../../utils/number';
import {RowOf} from '../../../../../utils/table';
import {ProcessingState} from '../../../../../utils/processing';
import {FormValue, selectFormDirty, selectFormValid} from '../../../../../utils/form';
import {confirmUnsavedChangesBeforeUnload} from '../../../../../utils/confirm';

import {PageTitleService} from '../../../../../services/page-title.service';
import {CurrentAppUserService} from '../../../../../services/current-app-user.service';
import {InventoryService} from '../../../../../services/inventory.service';
import {AppUsersService} from '../../../../../services/app-users.service';
import {Destroyed$} from '../../../../../services/destroyed$.service';

import {OtherAppUser} from '../../../../../models/app-user';
import {SaveablePage} from '../../../../../guards/unsaved-page-changes.guard';

type ReviewInventoryItemChangeForm = FormGroup<{
  approved: FormControl<boolean | null, {}>;
}, {}>;
type ReviewInventoryItemChangeFormValue = FormValue<ReviewInventoryItemChangeForm>;

@Component({
  selector: 'inventory-system-review-inventory-item-change',
  templateUrl: './review-change.component.html',
  styleUrls: ['./review-change.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Destroyed$]
})
export class ReviewInventoryItemChangeComponent implements OnInit, SaveablePage {
  public readonly params$ = this.route.params as Observable<{
    id: string;
    changeSequence: string;
  }>;

  public readonly reviewItemId$ = this.params$.pipe(pluck('id'), map(stringToNumber));
  public readonly reviewItemHistory$ = this.reviewItemId$.pipe(
    switchMap(reviewItemId => (
      reviewItemId == null ? of(undefined)
      : selectLoadedValue(this.inventoryService.selectItemHistoryById(reviewItemId))
    )),
    cacheUntil(this.destroyed$)
  );
  public readonly reviewItemChangeSequence$ = this.params$.pipe(pluck('changeSequence'), map(stringToNumber));
  public readonly reviewItemChange$ = combineLatest([
    this.reviewItemHistory$,
    this.reviewItemChangeSequence$
  ]).pipe(
    map(([reviewItemHistory, reviewItemChangeSequence]) => (
      (reviewItemHistory == null || reviewItemChangeSequence == null) ? undefined
      : reviewItemHistory.changeBySequence[reviewItemChangeSequence]
    )),
    cacheUntil(this.destroyed$)
  );
  public readonly isAdministrator$ = selectLoadedValue(this.currentAppUserService.isAdministrator$);
  public readonly reviewItemChangeAppUser$ = combineLatest([
    this.reviewItemChange$,
    this.isAdministrator$
  ]).pipe(
    switchMap(([reviewItemChange, isAdministrator]) => (
      (reviewItemChange?.userId == null || !isAdministrator) ? of(undefined)
      : selectLoadedValue(this.appUsersService.selectAppUserById(reviewItemChange.userId))
    ))
  );
  public readonly reviewItemChangeOldSnapshot$ = combineLatest([
    this.reviewItemHistory$,
    this.reviewItemChange$
  ]).pipe(
    map(([reviewItemHistory, reviewItemChange]) => {
      if (reviewItemHistory == null || reviewItemChange == null || reviewItemChange.sequence === 1) {
        return undefined;
      }

      const previousChange = reviewItemHistory.changeBySequence[reviewItemChange.sequence - 1]!;
      if (previousChange.newSnapshotSequence == null) {
        return undefined;
      }

      return reviewItemHistory.snapshotBySequence[previousChange.newSnapshotSequence];
    })
  );
  public readonly reviewItemChangeNewSnapshot$ = combineLatest([
    this.reviewItemHistory$,
    this.reviewItemChange$
  ]).pipe(
    map(([reviewItemHistory, reviewItemChange]) => (
      (
        reviewItemHistory == null
        || reviewItemChange == null
        || reviewItemChange.newSnapshotSequence == null
      ) ? undefined
      : reviewItemHistory.snapshotBySequence[reviewItemChange.newSnapshotSequence]
    ))
  );

  public readonly loading$ = combineLatest([
    selectInitialLoading(this.inventoryService.itemHistories$),
    selectInitialLoading(this.inventoryService.assigneeHistories$),
    this.reviewItemHistory$.pipe(startWith(undefined), map(isNull)),
    this.reviewItemChange$.pipe(startWith(undefined), map(isNull)),
    selectInitialLoading(this.currentAppUserService.isAdministrator$.pipe(
      switchMapLoadable(Loadable.loading, (isAdministrator): Observable<Loadable<OtherAppUser[] | undefined>> => (
        isAdministrator ? this.appUsersService.appUsers$
        : of(Loadable.loaded(undefined))
      ))
    ))
  ]).pipe(map(someTrue));

  public readonly changeRows$ = combineLatest([
    this.reviewItemChangeOldSnapshot$,
    this.reviewItemChangeNewSnapshot$,
    selectLoadedValue(this.inventoryService.assigneeHistoryById$)
  ]).pipe(
    map(([oldSnapshot, newSnapshot, assigneeHistoryById]): Array<Readonly<
      {fieldName: string;}
      & (
        | {type: 'string'; oldValue?: string; newValue?: string;}
        | {type: 'number'; oldValue?: number; newValue?: number;}
        | {type: 'boolean'; oldValue?: boolean; newValue?: boolean;}
        | {type: 'date'; oldValue?: Date; newValue?: Date;}
      )
    >> => [
      oldSnapshot?.name !== newSnapshot?.name && {
        fieldName: 'Name',
        type: 'string' as const,
        oldValue: oldSnapshot?.name,
        newValue: newSnapshot?.name
      },
      oldSnapshot?.category !== newSnapshot?.category && {
        fieldName: 'Category',
        type: 'string' as const,
        oldValue: oldSnapshot?.category,
        newValue: newSnapshot?.category
      },
      oldSnapshot?.cost !== newSnapshot?.cost && {
        fieldName: 'Cost',
        type: 'number' as const,
        oldValue: oldSnapshot?.cost,
        newValue: newSnapshot?.cost
      },
      oldSnapshot?.building !== newSnapshot?.building && {
        fieldName: 'Building',
        type: 'string' as const,
        oldValue: oldSnapshot?.building,
        newValue: newSnapshot?.building
      },
      oldSnapshot?.floor !== newSnapshot?.floor && {
        fieldName: 'Floor',
        type: 'string' as const,
        oldValue: oldSnapshot?.floor,
        newValue: newSnapshot?.floor
      },
      oldSnapshot?.room !== newSnapshot?.room && {
        fieldName: 'Room',
        type: 'string' as const,
        oldValue: oldSnapshot?.room,
        newValue: newSnapshot?.room
      },
      (
        ((oldSnapshot?.acquiredDate == null) !== (newSnapshot?.acquiredDate == null))
        || (
          oldSnapshot?.acquiredDate != null
          && newSnapshot?.acquiredDate != null
          && !datesEqual(oldSnapshot.acquiredDate, newSnapshot.acquiredDate)
        )
      ) && {
        fieldName: 'Acquired Date',
        type: 'date' as const,
        oldValue: oldSnapshot?.acquiredDate,
        newValue: newSnapshot?.acquiredDate
      },
      (
        ((oldSnapshot?.surplussedDate == null) !== (newSnapshot?.surplussedDate == null))
        || (
          oldSnapshot?.surplussedDate != null
          && newSnapshot?.surplussedDate != null
          && !datesEqual(oldSnapshot.surplussedDate, newSnapshot.surplussedDate)
        )
      ) && {
        fieldName: 'Surplussed Date',
        type: 'date' as const,
        oldValue: oldSnapshot?.surplussedDate,
        newValue: newSnapshot?.surplussedDate
      },
      oldSnapshot?.assigneeId !== newSnapshot?.assigneeId && {
        fieldName: 'Assignee',
        type: 'string' as const,
        oldValue: (
          oldSnapshot?.assigneeId == null ? undefined
          : assigneeHistoryById[oldSnapshot.assigneeId]?.lastUndeletedSnapshot.name
        ),
        newValue: (
          newSnapshot?.assigneeId == null ? undefined
          : assigneeHistoryById[newSnapshot.assigneeId]?.lastUndeletedSnapshot.name
        )
      },
      ((oldSnapshot?.flaggedReason == null) !== (newSnapshot?.flaggedReason == null)) && {
        fieldName: 'Flagged',
        type: 'boolean' as const,
        oldValue: oldSnapshot?.flaggedReason != null,
        newValue: newSnapshot?.flaggedReason != null,
      },
      (
        oldSnapshot?.flaggedReason !== newSnapshot?.flaggedReason
        && (
          (oldSnapshot?.flaggedReason ?? '') !== ''
          || (newSnapshot?.flaggedReason ?? '') !== ''
        )
      ) && {
        fieldName: 'Flagged Reason',
        type: 'string' as const,
        oldValue: oldSnapshot?.flaggedReason,
        newValue: newSnapshot?.flaggedReason
      }
    ].filter(isNotFalse)),
    cacheUntil(this.destroyed$)
  );
  public readonly changeDataSource = new MatTableDataSource<RowOf<ReviewInventoryItemChangeComponent, 'changeRows$'>>();
  public readonly changeColumns = [
    'fieldName',
    'oldValue',
    'newValue'
  ] as const;

  public readonly form: ReviewInventoryItemChangeForm = this.formBuilder.group({
    approved: this.formBuilder.control(null)
  });
  private formReviewItemId?: number;
  private formReviewItemChangeSequence?: number;
  public readonly initialFormValue$ = this.reviewItemChange$.pipe(
    filter(isNotNull),
    map(({approved}): ReviewInventoryItemChangeFormValue => ({
      approved: approved ?? null
    }))
  );
  public readonly formDirty$ = selectFormDirty(this.form, this.initialFormValue$).pipe(cacheUntil(this.destroyed$));
  public readonly formValid$ = selectFormValid(this.form);

  public readonly dirty$ = this.reviewItemChange$.pipe(
    switchMap(reviewItemChange => reviewItemChange == null ? of(false) : this.formDirty$)
  );

  public readonly saveState$ = new BehaviorSubject<ProcessingState>(ProcessingState.idle);

  public constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly pageTitleService: PageTitleService,
    private readonly currentAppUserService: CurrentAppUserService,
    private readonly inventoryService: InventoryService,
    private readonly appUsersService: AppUsersService,
    private readonly destroyed$: Destroyed$
  ) { }

  public async ngOnInit() {
    this.pageTitleService.set('Review Inventory Item Change');
    combineLatest([
      this.reviewItemHistory$.pipe(filter(isNotNull)),
      this.reviewItemChange$.pipe(filter(isNotNull))
    ]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(([reviewItemHistory, reviewItemChange]) => {
      this.pageTitleService.set(
        `Review Inventory Item Change - ${reviewItemHistory.lastUndeletedSnapshot.name} - Change #${reviewItemChange.sequence}`
      );
    });

    this.changeRows$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(changeRows => this.changeDataSource.data = changeRows);

    confirmUnsavedChangesBeforeUnload(this.dirty$);

    combineLatest([
      this.reviewItemId$.pipe(filter(isNotNull)),
      this.reviewItemChangeSequence$.pipe(filter(isNotNull)),
      this.initialFormValue$
    ]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(([reviewItemId, reviewItemChangeSequence, initialFormValue]) => {
      this.resetForm(reviewItemId, reviewItemChangeSequence, initialFormValue);
    });

    const [reviewItemHistory, reviewItemChange] = await firstValueFrom(combineLatest([
      this.reviewItemHistory$,
      this.reviewItemChange$,
    ]));
    if (reviewItemHistory == null || reviewItemHistory.currentSnapshot == null || reviewItemChange == null) {
      await this.router.navigate(['..'], {relativeTo: this.route});
    }
  }

  public async save() {
    this.saveState$.next(ProcessingState.started);

    const [itemId, changeSequence] = await firstValueFrom(combineLatest([
      this.reviewItemId$.pipe(filter(isNotNull)),
      this.reviewItemChangeSequence$.pipe(filter(isNotNull))
    ]))
    const {approved} = this.form.value;

    try {
      this.inventoryService.approveItemChange(itemId, changeSequence, approved ?? undefined);
      this.saveState$.next(ProcessingState.idle);
    } catch (error: unknown) {
      this.saveState$.next(ProcessingState.failed(String(error)));
    }
  }

  private resetForm(
    reviewItemId: number,
    reviewItemChangeSequence: number,
    initialFormValue: ReviewInventoryItemChangeFormValue
  ) {
    if (this.formReviewItemId !== reviewItemId || this.formReviewItemChangeSequence !== reviewItemChangeSequence) {
      this.form.setValue(initialFormValue);
      this.formReviewItemId = reviewItemId;
      this.formReviewItemChangeSequence = reviewItemChangeSequence;
    }
  }
}
