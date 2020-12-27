import {Component, OnInit, ChangeDetectionStrategy, Input, TemplateRef} from '@angular/core';

@Component({
  selector: 'inventory-system-page[title]',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageComponent implements OnInit {
  @Input() public title!: string | TemplateRef<void>;
  @Input() public backLink?: string;
  @Input() public backText?: string;

  public get titleAsString() {
    return typeof this.title === 'string' ? this.title : undefined;
  }
  public get titleAsTemplate() {
    return this.titleAsString == null ? this.title as TemplateRef<void> : undefined;
  }

  public constructor() { }

  public ngOnInit() { }
}
