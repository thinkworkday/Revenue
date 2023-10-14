import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerizonDirectTagComponent } from './verizon-direct-tag.component';

describe('VerizonDirectTagComponent', () => {
  let component: VerizonDirectTagComponent;
  let fixture: ComponentFixture<VerizonDirectTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerizonDirectTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerizonDirectTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
