import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolexBcTagComponent } from './solex-bc-tag.component';

describe('SolexBcTagComponent', () => {
  let component: SolexBcTagComponent;
  let fixture: ComponentFixture<SolexBcTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolexBcTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolexBcTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
