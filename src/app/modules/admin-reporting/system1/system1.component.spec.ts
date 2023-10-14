import { ComponentFixture, TestBed } from '@angular/core/testing';

import { System1Component } from './system1.component';

describe('System1Component', () => {
  let component: System1Component;
  let fixture: ComponentFixture<System1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ System1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(System1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
