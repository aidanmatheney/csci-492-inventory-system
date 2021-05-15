import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InventoryChangesComponent} from './changes.component';

describe('InventoryChangesComponent', () => {
  let component: InventoryChangesComponent;
  let fixture: ComponentFixture<InventoryChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryChangesComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
