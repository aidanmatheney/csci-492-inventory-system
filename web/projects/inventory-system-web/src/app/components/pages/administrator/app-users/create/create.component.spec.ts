import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateAppUserComponent} from './create.component';

describe('CreateAppUserComponent', () => {
  let component: CreateAppUserComponent;
  let fixture: ComponentFixture<CreateAppUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAppUserComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAppUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
