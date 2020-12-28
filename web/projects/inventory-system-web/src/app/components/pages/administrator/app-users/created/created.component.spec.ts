import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AppUserCreatedComponent} from './created.component';

describe('AppUserCreatedComponent', () => {
  let component: AppUserCreatedComponent;
  let fixture: ComponentFixture<AppUserCreatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppUserCreatedComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppUserCreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
