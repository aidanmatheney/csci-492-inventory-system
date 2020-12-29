import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../../../services/page-title.service';

@Component({
  selector: 'inventory-system-view-inventory-item',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewInventoryItemComponent implements OnInit {
  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('View Inventory Item');
  }
}
