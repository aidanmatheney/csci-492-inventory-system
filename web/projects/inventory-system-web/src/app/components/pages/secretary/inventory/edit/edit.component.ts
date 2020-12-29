import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../../../services/page-title.service';

@Component({
  selector: 'inventory-system-edit-inventory-item',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditInventoryItemComponent implements OnInit {
  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Edit Inventory Item');
  }
}
