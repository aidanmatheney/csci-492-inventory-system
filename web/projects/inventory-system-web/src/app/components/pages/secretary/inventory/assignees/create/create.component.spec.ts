import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateInventoryAssigneeComponent} from './create.component';

describe('CreateInventoryAssigneeComponent', () => {
  let component: CreateInventoryAssigneeComponent;
  let fixture: ComponentFixture<CreateInventoryAssigneeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateInventoryAssigneeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInventoryAssigneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
