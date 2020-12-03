import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SpinnerButtonContainerComponent} from './spinner-button-container.component';

describe('SpinnerButtonContainerComponent', () => {
  let component: SpinnerButtonContainerComponent;
  let fixture: ComponentFixture<SpinnerButtonContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpinnerButtonContainerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerButtonContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
