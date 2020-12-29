import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {PageTitleService} from '../../../../../services/page-title.service';

@Component({
  selector: 'inventory-system-create-inventory-item',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateInventoryItemComponent implements OnInit {
  public constructor(
    private readonly pageTitleService: PageTitleService
  ) { }

  public ngOnInit() {
    this.pageTitleService.set('Create Inventory Item');
  }
}
