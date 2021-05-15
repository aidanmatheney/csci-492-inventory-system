import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ViewServerLogEntryComponent} from './view.component';

describe('ViewServerLogEntryComponent', () => {
  let component: ViewServerLogEntryComponent;
  let fixture: ComponentFixture<ViewServerLogEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewServerLogEntryComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewServerLogEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
