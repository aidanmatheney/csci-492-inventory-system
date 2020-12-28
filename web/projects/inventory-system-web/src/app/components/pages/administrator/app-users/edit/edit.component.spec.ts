import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EditAppUserComponent} from './edit.component';

describe('EditAppUserComponent', () => {
  let component: EditAppUserComponent;
  let fixture: ComponentFixture<EditAppUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditAppUserComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAppUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
