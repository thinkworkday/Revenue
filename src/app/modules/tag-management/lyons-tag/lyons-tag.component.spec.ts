import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LyonsTagComponent } from './lyons-tag.component';

describe('LyonsTagComponent', () => {
  let component: LyonsTagComponent;
  let fixture: ComponentFixture<LyonsTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LyonsTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LyonsTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
