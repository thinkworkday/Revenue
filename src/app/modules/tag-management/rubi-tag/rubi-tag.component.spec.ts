import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubiTagComponent } from './rubi-tag.component';

describe('RubiTagComponent', () => {
  let component: RubiTagComponent;
  let fixture: ComponentFixture<RubiTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubiTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubiTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
