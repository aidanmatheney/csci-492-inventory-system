import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {combineLatest} from 'rxjs';
import {filter, map, mapTo, skip, startWith, switchMapTo, takeUntil} from 'rxjs/operators';

import {distinctUntilLoadableChanged, Loadable, mapLoaded, pluckLoaded} from '../utils/loading';
import {tapLog} from '../utils/debug';
import {cacheUntil, firstValueFrom} from '../utils/observable';
import {recordBy} from '../utils/array';
import {OngoingOperations} from '../utils/processing';
import {memoize} from '../utils/memo';
import {VOID} from '../utils/type';

import {BroadcastService} from './broadcast.service';
import {Destroyed$} from './destroyed$.service';

import {environment} from '../../environments/environment';
import {
  InventoryAssignee,
  InventoryAssigneeChange,
  InventoryAssigneeHistory,
  InventoryAssigneeHistoryDto,
  InventoryAssigneeSnapshot,
  InventoryItem,
  InventoryItemChange,
  InventoryItemHistory,
  InventoryItemHistoryDto,
  InventoryItemSnapshot
} from '../models/inventory';

@Injectable({providedIn: 'root'})
export class InventoryService {
  private readonly baseUrl = `${environment.serverBaseUrl}/Api/Inventory`;

  private readonly ongoingModifications = new OngoingOperations();

  private readonly refreshInventory$ = combineLatest([
    this.ongoingModifications.count$,
    this.broadcastService.refreshInventory$.pipe(startWith(VOID))
  ]).pipe(
    filter(([ongoingModificationCount]) => ongoingModificationCount === 0),
    mapTo(VOID)
  );

  public constructor(
    private readonly http: HttpClient,
    private readonly broadcastService: BroadcastService,
    private readonly destroyed$: Destroyed$
  ) {
    this.ongoingModifications.none$.pipe(
      skip(1),
      takeUntil(this.destroyed$)
    ).subscribe(() => this.broadcastService.refreshInventory());
  }

  public readonly itemHistories$ = this.refreshInventory$.pipe(
    switchMapTo(this.httpGetItemHistories().pipe(
      map(itemHistoryDtos => Loadable.loaded(itemHistoryDtos.map(({
        item,
        changes: changeDtos,
        snapshots: snapshotDtos
      }): InventoryItemHistory => {
        const changes = changeDtos.map((changeDto): InventoryItemChange => ({
          ...changeDto,
          date: new Date(changeDto.date)
        }));
        const snapshots = snapshotDtos.map((snapshotDto): InventoryItemSnapshot => ({
          ...snapshotDto,
          acquiredDate: snapshotDto.acquiredDate == null ? undefined : new Date(snapshotDto.acquiredDate),
          surplussedDate: snapshotDto.surplussedDate == null ? undefined : new Date(snapshotDto.surplussedDate),
        }));

        const changeBySequence = recordBy(changes, change => change.sequence);
        const snapshotBySequence = recordBy(snapshots, snapshot => snapshot.sequence);

        const newestChangeSequence = Math.max(...changes.map(change => change.sequence));
        const newestChange = changeBySequence[newestChangeSequence]!;

        const currentSnapshot = (newestChange.newSnapshotSequence == null
          ? undefined
          : snapshotBySequence[newestChange.newSnapshotSequence]!
        );

        const lastNonDeletionChangeSequence = Math.max(...changes
          .filter(change => change.newSnapshotSequence != null)
          .map(change => change.sequence)
        );
        const lastNonDeletionChange = changeBySequence[lastNonDeletionChangeSequence]!;

        const lastUndeletedSnapshot = snapshotBySequence[lastNonDeletionChange.newSnapshotSequence!]!;

        const approvedChanges = changes.filter(change => change.approved === true);
        const newestApprovedChangeSequence = (approvedChanges.length === 0
          ? undefined
          : Math.max(...approvedChanges.map(change => change.sequence))
        );
        const newestApprovedChange = (newestApprovedChangeSequence == null
          ? undefined
          : changeBySequence[newestApprovedChangeSequence]!
        );

        const currentApprovedSnapshot = (newestApprovedChange?.newSnapshotSequence == null
          ? undefined
          : snapshotBySequence[newestApprovedChange.newSnapshotSequence]!
        );

        return {
          item,
          changeBySequence,
          snapshotBySequence,
          newestChange,
          currentSnapshot,
          lastUndeletedSnapshot,
          newestApprovedChange,
          currentApprovedSnapshot
        };
      }))),
      startWith(Loadable.loading)
    )),
    startWith(Loadable.loading),
    distinctUntilLoadableChanged(),
    tapLog('InventoryService itemHistories$'), // TODO: remove
    cacheUntil(this.destroyed$)
  );

  private readonly itemHistoryById$ = this.itemHistories$.pipe(
    mapLoaded(itemHistories => recordBy(itemHistories, itemHistory => itemHistory.item.id)),
    cacheUntil(this.destroyed$)
  );
  public readonly selectItemHistoryById = memoize((id: number) => {
    return this.itemHistoryById$.pipe(
      pluckLoaded(id),
      distinctUntilLoadableChanged()
    );
  });

  private readonly itemHistoryByBarcode$ = this.itemHistories$.pipe(
    mapLoaded(itemHistories => recordBy(itemHistories, itemHistory => itemHistory.item.barcode)),
    cacheUntil(this.destroyed$)
  );
  public readonly selectItemHistoryByBarcode = memoize((id: string) => {
    return this.itemHistoryByBarcode$.pipe(
      pluckLoaded(id),
      distinctUntilLoadableChanged()
    );
  });

  public readonly assigneeHistories$ = this.refreshInventory$.pipe(
    switchMapTo(this.httpGetAssigneeHistories().pipe(
      map(assigneeHistoryDtos => Loadable.loaded(assigneeHistoryDtos.map(({
        assignee,
        changes: changeDtos,
        snapshots
      }): InventoryAssigneeHistory => {
        const changes = changeDtos.map((changeDto): InventoryAssigneeChange => ({
          ...changeDto,
          date: new Date(changeDto.date)
        }));

        const changeBySequence = recordBy(changes, change => change.sequence);
        const snapshotBySequence = recordBy(snapshots, snapshot => snapshot.sequence);

        const newestChangeSequence = Math.max(...changes.map(change => change.sequence));
        const newestChange = changeBySequence[newestChangeSequence]!;

        const currentSnapshot = (newestChange.newSnapshotSequence == null
          ? undefined
          : snapshotBySequence[newestChange.newSnapshotSequence]!
        );

        const lastNonDeletionChangeSequence = Math.max(...changes
          .filter(change => change.newSnapshotSequence != null)
          .map(change => change.sequence)
        );
        const lastNonDeletionChange = changeBySequence[lastNonDeletionChangeSequence]!;

        const lastUndeletedSnapshot = snapshotBySequence[lastNonDeletionChange.newSnapshotSequence!]!;

        const approvedChanges = changes.filter(change => change.approved === true);
        const newestApprovedChangeSequence = (approvedChanges.length === 0
          ? undefined
          : Math.max(...approvedChanges.map(change => change.sequence))
        );
        const newestApprovedChange = (newestApprovedChangeSequence == null
          ? undefined
          : changeBySequence[newestApprovedChangeSequence]!
        );

        const currentApprovedSnapshot = (newestApprovedChange?.newSnapshotSequence == null
          ? undefined
          : snapshotBySequence[newestApprovedChange.newSnapshotSequence]!
        );

        return {
          assignee,
          changeBySequence,
          snapshotBySequence,
          newestChange,
          currentSnapshot,
          lastUndeletedSnapshot,
          newestApprovedChange,
          currentApprovedSnapshot
        };
      }))),
      startWith(Loadable.loading)
    )),
    startWith(Loadable.loading),
    distinctUntilLoadableChanged(),
    tapLog('InventoryService assigneeHistories$'), // TODO: remove
    cacheUntil(this.destroyed$)
  );

  private readonly assigneeHistoryById$ = this.assigneeHistories$.pipe(
    mapLoaded(assigneeHistories => recordBy(assigneeHistories, assigneeHistory => assigneeHistory.assignee.id)),
    cacheUntil(this.destroyed$)
  );
  public readonly selectAssigneeHistoryById = memoize((id: number) => {
    return this.assigneeHistoryById$.pipe(
      pluckLoaded(id),
      distinctUntilLoadableChanged()
    );
  });

  public createItem({
    barcode,
    name,
    category,
    cost,
    building,
    floor,
    room,
    acquiredDate,
    surplussedDate
  }: {
    barcode: string;
    name: string;
    category?: string;
    cost?: number;
    building?: string;
    floor?: string
    room?: string
    acquiredDate?: Date;
    surplussedDate?: Date;
  }) {
    return this.ongoingModifications.incrementWhile(async () => {
      const {newItemId} = await firstValueFrom(this.httpCreateItem({
        item: {
          id: 0,
          barcode
        },
        snapshot: {
          itemId: 0,
          sequence: 0,
          name,
          category,
          cost,
          building,
          floor,
          room,
          acquiredDate,
          surplussedDate
        }
      }));

      return {newItemId};
    });
  }

  public updateItem({
    itemId,
    name,
    category,
    cost,
    building,
    floor,
    room,
    acquiredDate,
    surplussedDate,
    assigneeId,
    flaggedReason
  }: {
    itemId: number;
    name: string;
    category?: string;
    cost?: number;
    building?: string;
    floor?: string
    room?: string
    acquiredDate?: Date;
    surplussedDate?: Date;
    assigneeId?: number;
    flaggedReason?: string;
  }) {
    return this.ongoingModifications.incrementWhile(async () => {
      await firstValueFrom(this.httpUpdateItem(itemId, {
        snapshot: {
          itemId,
          sequence: 0,
          name,
          category,
          cost,
          building,
          floor,
          room,
          acquiredDate,
          surplussedDate,
          assigneeId,
          flaggedReason
        }
      }));
    });
  }

  public deleteItem(itemId: number) {
    return this.ongoingModifications.incrementWhile(() => firstValueFrom(this.httpDeleteItem(itemId)));
  }

  public approveItemChange() {

  }

  public createAssignee({
    name,
    email
  }: {
    name: string;
    email: string;
  }) {
    return this.ongoingModifications.incrementWhile(async () => {
      const {newAssigneeId} = await firstValueFrom(this.httpCreateAssignee({
        assignee: {id: 0},
        snapshot: {
          assigneeId: 0,
          sequence: 0,
          name,
          email
        }
      }));

      return {newAssigneeId};
    });
  }

  public updateAssignee({
    assigneeId,
    name,
    email
  }: {
    assigneeId: number;
    name: string;
    email: string;
  }) {
    return this.ongoingModifications.incrementWhile(async () => {
      await firstValueFrom(this.httpUpdateAssignee(assigneeId, {
        snapshot: {
          assigneeId,
          sequence: 0,
          name,
          email
        }
      }));
    });
  }

  public deleteAssignee(assigneeId: number) {
    return this.ongoingModifications.incrementWhile(() => firstValueFrom(this.httpDeleteAssignee(assigneeId)));
  }

  public approveAssigneeChange() {

  }

  private httpGetItemHistories() {
    const url = `${this.baseUrl}/ItemHistories`;
    return this.http.get<InventoryItemHistoryDto[]>(url);
  }

  private httpCreateItem(request: {
    item: InventoryItem;
    snapshot: InventoryItemSnapshot;
  }) {
    const url = this.getItemsUrl();
    return this.http.post<{
      newItemId: number;
    }>(url, request);
  }

  private httpUpdateItem(itemId: number, request: {
    snapshot: InventoryItemSnapshot;
  }) {
    const url = this.getItemUrl(itemId);
    return this.http.put<void>(url, request);
  }

  private httpDeleteItem(itemId: number) {
    const url = this.getItemUrl(itemId);
    return this.http.delete<void>(url);
  }

  private httpApproveItemChange(itemId: number, changeSequence: number, request: {
    approved?: boolean;
  }) {
    const url = `${this.getItemUrl(itemId)}/Changes/${encodeURIComponent(changeSequence)}`;
    return this.http.post<void>(url, request);
  }

  private httpGetAssigneeHistories() {
    const url = `${this.baseUrl}/AssigneeHistories`;
    return this.http.get<InventoryAssigneeHistoryDto[]>(url);
  }

  private httpCreateAssignee(request: {
    assignee: InventoryAssignee;
    snapshot: InventoryAssigneeSnapshot;
  }) {
    const url = this.getAssigneesUrl();
    return this.http.post<{
      newAssigneeId: number;
    }>(url, request);
  }

  private httpUpdateAssignee(assigneeId: number, request: {
    snapshot: InventoryAssigneeSnapshot;
  }) {
    const url = this.getAssigneeUrl(assigneeId);
    return this.http.put<void>(url, request);
  }

  private httpDeleteAssignee(assigneeId: number) {
    const url = this.getAssigneeUrl(assigneeId);
    return this.http.delete<void>(url);
  }

  private httpApproveAssigneeChange(assigneeId: number, changeSequence: number, request: {
    approved?: boolean;
  }) {
    const url = `${this.getAssigneeUrl(assigneeId)}/Changes/${encodeURIComponent(changeSequence)}`;
    return this.http.post<void>(url, request);
  }

  private getItemsUrl() {
    return `${this.baseUrl}/Items`;
  }

  private getItemUrl(itemId: number) {
    return `${this.getItemsUrl()}/${encodeURIComponent(itemId)}`;
  }

  private getAssigneesUrl() {
    return `${this.baseUrl}/Assignees`;
  }

  private getAssigneeUrl(assigneeId: number) {
    return `${this.getAssigneesUrl()}/${encodeURIComponent(assigneeId)}`
  }
}
