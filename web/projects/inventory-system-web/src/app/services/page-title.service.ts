import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Injectable({providedIn: 'root'})
export class PageTitleService {
  public constructor(
    private readonly titleService: Title
  ) { }

  public set(title: string) {
    this.titleService.setTitle(`${title} - Inventory System`);
  }

  public clear() {
    this.titleService.setTitle('Inventory System');
  }
}
