import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EditInventoryAssigneeComponent} from './edit.component';

describe('EditInventoryAssigneeComponent', () => {
  let component: EditInventoryAssigneeComponent;
  let fixture: ComponentFixture<EditInventoryAssigneeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditInventoryAssigneeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInventoryAssigneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
