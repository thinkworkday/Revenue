import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleSheetReportingComponent } from './google-sheet-reporting.component';

describe('GoogleSheetReportingComponent', () => {
  let component: GoogleSheetReportingComponent;
  let fixture: ComponentFixture<GoogleSheetReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleSheetReportingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleSheetReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
