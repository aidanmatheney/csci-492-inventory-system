import {PartialRecord} from '../utils/record';
import {IsoDateString} from '../utils/type';

export interface InventoryItemHistoryDto {
  item: InventoryItem;
  changes: InventoryItemChangeDto[];
  snapshots: InventoryItemSnapshotDto[];
}
export interface InventoryItemHistory {
  item: InventoryItem;
  changeBySequence: PartialRecord<number, InventoryItemChange>;
  snapshotBySequence: PartialRecord<number, InventoryItemSnapshot>;
  newestChange: InventoryItemChange;
  currentSnapshot?: InventoryItemSnapshot;
  lastUndeletedSnapshot: InventoryItemSnapshot;
  newestApprovedChange?: InventoryItemChange;
  currentApprovedSnapshot?: InventoryItemSnapshot;
}

export interface InventoryItem {
  id: number;
  barcode: string;
}

export interface InventoryItemChange {
  itemId: number;
  sequence: number;
  newSnapshotSequence?: number;

  userId?: string;
  date: Date;

  approved?: boolean;
}
export type InventoryItemChangeDto = Omit<InventoryItemChange, 'date'> & {
  date: IsoDateString;
};

export interface InventoryItemSnapshot {
  itemId: number;
  sequence: number;

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
}
export type InventoryItemSnapshotDto = Omit<InventoryItemSnapshot, 'acquiredDate' | 'surplussedDate'> & {
  acquiredDate?: IsoDateString;
  surplussedDate?: IsoDateString;
};

export interface InventoryAssigneeHistoryDto {
  assignee: InventoryAssignee;
  changes: InventoryAssigneeChangeDto[];
  snapshots: InventoryAssigneeSnapshot[];
}
export interface InventoryAssigneeHistory {
  assignee: InventoryAssignee;
  changeBySequence: PartialRecord<number, InventoryAssigneeChange>;
  snapshotBySequence: PartialRecord<number, InventoryAssigneeSnapshot>;
  newestChange: InventoryAssigneeChange;
  currentSnapshot?: InventoryAssigneeSnapshot;
  lastUndeletedSnapshot: InventoryAssigneeSnapshot;
  newestApprovedChange?: InventoryAssigneeChange;
  currentApprovedSnapshot?: InventoryAssigneeSnapshot;
}

export interface InventoryAssignee {
  id: number;
}

export interface InventoryAssigneeChange {
  assigneeId: number;
  sequence: number;
  newSnapshotSequence?: number;

  userId?: string;
  date: Date;

  approved?: boolean;
}
export type InventoryAssigneeChangeDto = Omit<InventoryAssigneeChange, 'date'> & {
  date: IsoDateString;
};

export interface InventoryAssigneeSnapshot {
  assigneeId: number;
  sequence: number;

  name: string;
  email: string;
}
