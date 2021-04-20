import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ViewInventoryAssigneeeComponent} from './view.component';

describe('ViewInventoryAssigneeeComponent', () => {
  let component: ViewInventoryAssigneeeComponent;
  let fixture: ComponentFixture<ViewInventoryAssigneeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewInventoryAssigneeeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewInventoryAssigneeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
