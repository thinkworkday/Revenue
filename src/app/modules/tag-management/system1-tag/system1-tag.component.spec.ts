import { ComponentFixture, TestBed } from '@angular/core/testing';

import { System1TagComponent } from './system1-tag.component';

describe('System1TagComponent', () => {
  let component: System1TagComponent;
  let fixture: ComponentFixture<System1TagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ System1TagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(System1TagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
