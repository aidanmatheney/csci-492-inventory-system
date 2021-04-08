import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigneesComponent } from './assignees.component';

describe('AssigneesComponent', () => {
  let component: AssigneesComponent;
  let fixture: ComponentFixture<AssigneesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssigneesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssigneesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
