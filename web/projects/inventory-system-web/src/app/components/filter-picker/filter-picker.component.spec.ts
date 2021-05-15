import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FilterPickerComponent} from './filter-picker.component';

describe('FilterPickerComponent', () => {
  let component: FilterPickerComponent<'contains', 'string'>;
  let fixture: ComponentFixture<FilterPickerComponent<'contains', 'string'>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterPickerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent<FilterPickerComponent<'contains', 'string'>>(FilterPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
