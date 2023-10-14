import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApptitudeTagComponent } from './apptitude-tag.component';

describe('ApptitudeTagComponent', () => {
  let component: ApptitudeTagComponent;
  let fixture: ComponentFixture<ApptitudeTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApptitudeTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApptitudeTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
