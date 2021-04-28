import {Injectable} from '@angular/core';
import {fromEvent} from 'rxjs';
import {filter, pluck} from 'rxjs/operators';

import {Destroyed$} from './destroyed$.service';

type BroadcastMessageOfType<T extends string, P = {}> = {readonly type: T;} & P;
type BroadcastMessage = (
  | BroadcastMessageOfType<'refreshInventory'>
  | BroadcastMessageOfType<'refreshSettings'>
  | BroadcastMessageOfType<'refreshUsers'>
);

@Injectable({providedIn: 'root'})
export class BroadcastService {
  private readonly channel = new BroadcastChannel('inventory-system-395c4484-5c41-4c9f-a194-3cd36d9cb3b8');
  private readonly messageEvent$ = fromEvent<MessageEvent<BroadcastMessage>>(this.channel, 'message');

  public readonly refreshInventory$ = this.selectMessage('refreshInventory');
  public readonly refreshSettings$ = this.selectMessage('refreshSettings');
  public readonly refreshUsers$ = this.selectMessage('refreshUsers');

  public constructor(
    private readonly destroyed$: Destroyed$
  ) {
    this.destroyed$.subscribe(() => this.channel.close());
  }

  public refreshInventory() {
    this.postMessage({type: 'refreshInventory'});
  }

  public refreshSettings() {
    this.postMessage({type: 'refreshSettings'});
  }

  public refreshUsers() {
    this.postMessage({type: 'refreshUsers'});
  }

  private selectMessage<T extends BroadcastMessage['type']>(type: T) {
    return this.messageEvent$.pipe(
      pluck('data'),
      filter((message): message is (BroadcastMessage & {readonly type: T;}) => message.type === type)
    );
  }

  private postMessage(message: BroadcastMessage) {
    this.channel.postMessage(message);
  }
}
