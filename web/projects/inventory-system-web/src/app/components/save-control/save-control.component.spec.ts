import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SaveControlComponent} from './save-control.component';

describe('SaveControlComponent', () => {
  let component: SaveControlComponent<{}, {}>;
  let fixture: ComponentFixture<SaveControlComponent<{}, {}>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveControlComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
