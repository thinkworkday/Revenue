import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolexBcComponent } from './solex-bc.component';

describe('SolexBcComponent', () => {
  let component: SolexBcComponent;
  let fixture: ComponentFixture<SolexBcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolexBcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolexBcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
