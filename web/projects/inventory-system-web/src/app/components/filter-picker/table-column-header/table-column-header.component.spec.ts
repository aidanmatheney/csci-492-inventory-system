import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FilterPickerTableColumnHeaderComponent} from './table-column-header.component';

describe('FilterPickerTableColumnHeaderComponent', () => {
  let component: FilterPickerTableColumnHeaderComponent<'contains', 'string'>;
  let fixture: ComponentFixture<FilterPickerTableColumnHeaderComponent<'contains', 'string'>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterPickerTableColumnHeaderComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent<FilterPickerTableColumnHeaderComponent<'contains', 'string'>>(
      FilterPickerTableColumnHeaderComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
