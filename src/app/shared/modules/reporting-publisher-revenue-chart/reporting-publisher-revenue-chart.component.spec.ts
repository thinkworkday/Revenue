import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingPublisherRevenueChartComponent } from './reporting-publisher-revenue-chart.component';

describe('ReportingPublisherRevenueChartComponent', () => {
  let component: ReportingPublisherRevenueChartComponent;
  let fixture: ComponentFixture<ReportingPublisherRevenueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportingPublisherRevenueChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingPublisherRevenueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
