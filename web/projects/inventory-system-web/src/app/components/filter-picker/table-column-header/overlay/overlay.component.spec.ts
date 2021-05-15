import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FilterPickerTableColumnHeaderOverlayComponent} from './overlay.component';

describe('FilterPickerTableColumnHeaderOverlayComponent', () => {
  let component: FilterPickerTableColumnHeaderOverlayComponent<'contains', 'string'>;
  let fixture: ComponentFixture<FilterPickerTableColumnHeaderOverlayComponent<'contains', 'string'>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterPickerTableColumnHeaderOverlayComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent<FilterPickerTableColumnHeaderOverlayComponent<'contains', 'string'>>(
      FilterPickerTableColumnHeaderOverlayComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
