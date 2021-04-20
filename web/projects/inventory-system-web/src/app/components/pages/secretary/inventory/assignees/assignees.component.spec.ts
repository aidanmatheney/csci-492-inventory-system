import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InventoryAssigneesComponent} from './assignees.component';

describe('InventoryAssigneesComponent', () => {
  let component: InventoryAssigneesComponent;
  let fixture: ComponentFixture<InventoryAssigneesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryAssigneesComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryAssigneesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
