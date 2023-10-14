import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HopkinTagComponent } from './hopkin-tag.component';

describe('HopkinTagComponent', () => {
  let component: HopkinTagComponent;
  let fixture: ComponentFixture<HopkinTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HopkinTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HopkinTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
