import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReviewInventoryItemChangeComponent} from './review-change.component';

describe('ReviewInventoryItemChangeComponent', () => {
  let component: ReviewInventoryItemChangeComponent;
  let fixture: ComponentFixture<ReviewInventoryItemChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewInventoryItemChangeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewInventoryItemChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
