import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EditInventoryItemComponent} from './edit.component';

describe('EditInventoryItemComponent', () => {
  let component: EditInventoryItemComponent;
  let fixture: ComponentFixture<EditInventoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditInventoryItemComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInventoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
