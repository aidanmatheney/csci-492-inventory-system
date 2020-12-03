import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProcessingControlComponent} from './processing-control.component';

describe('ProcessingControlComponent', () => {
  let component: ProcessingControlComponent;
  let fixture: ComponentFixture<ProcessingControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessingControlComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
