import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ManageAppUsersComponent} from './manage.component';

describe('ManageAppUsersComponent', () => {
  let component: ManageAppUsersComponent;
  let fixture: ComponentFixture<ManageAppUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageAppUsersComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAppUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
