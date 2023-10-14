import { Component, OnInit, Input } from '@angular/core';
import { LayoutService } from '../../../../../core';
import * as moment from 'moment';

@Component({
  selector: 'app-mixed-widget1',
  templateUrl: './mixed-widget1.component.html',
})
export class MixedWidget1Component implements OnInit {
  chartOptions: any = {};
  chartSubOptions: any = [];
  chartSeries: any = [];
  fontFamily = '';
  colorsGrayGray500 = '';
  colorsGrayGray200 = '';
  colorsGrayGray300 = '';
  colorsThemeBaseDanger = '';
  @Input() public ChartData: any;
  @Input() public CompanyName: string;
  perionCurrentSum = 0;
  perionBeforeSum = 0;
  currentMonthSum = 0;
  previousMonthSum = 0;

  allDaysList: any = [];

  constructor(
    private layout: LayoutService,
  ) {

    this.fontFamily = this.layout.getProp('js.fontFamily');
    this.colorsGrayGray500 = this.layout.getProp('js.colors.gray.gray500');
    this.colorsGrayGray200 = this.layout.getProp('js.colors.gray.gray200');
    this.colorsGrayGray300 = this.layout.getProp('js.colors.gray.gray300');
    this.colorsThemeBaseDanger = this.layout.getProp(
      'js.colors.theme.base.danger'
    );
  }

  ngOnInit(): void {
    // const timing = window.performance.timing;
    // const latency = timing.responseEnd - timing.fetchStart;
    
    // console.log("===========",performance.getEntriesByType("resource")[0], latency,timing, timing.responseEnd, timing.fetchStart)
    this.allDaysList = this.getCurrentMontDateList();
    this.ChartData = this.getChartData(this.ChartData);
    var tempCurSum = 0;
    var tempPreSum = 0;
    for (var chart of this.ChartData) {
      this.chartSeries.push({
        name: chart.statType,
        data: chart.revenuePerDay
      });
      tempCurSum = tempCurSum + chart.revenueCurrentSum;
      tempPreSum = tempPreSum + chart.revenueBeforeSum;
    }
    this.currentMonthSum = tempCurSum;
    this.previousMonthSum = tempPreSum;
    this.chartOptions = this.getChartOptions(this.chartSeries);
    for (var subChart of this.ChartData) {
      this.chartSubOptions.push(this.getSubChartOptions(subChart));
    }
  }

  getCurrentMontDateList() {
    const lastThirtyDays = [...new Array(30)].map((i, idx) => moment().utc().startOf("day").subtract(idx, "days").toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime()).reverse();
    return lastThirtyDays;
  }

  getChartOptions(chartSeries: any) {
    const strokeColor = '#D13647';
    return {
      series: chartSeries,
      chart: {
        height: 200,
        type: 'area',
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: false,
        },
        dropShadow: {
          enabled: true,
          enabledOnSeries: undefined,
          top: 5,
          left: 0,
          blur: 3,
          opacity: 0.4,
        },
      },
      plotOptions: {},
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        show: true,
        width: 3,
        //colors: [strokeColor],
      },
      xaxis: {
        type: "datetime",
        categories: this.allDaysList,
        axisBorder: {
          show: true,
        },
        axisTicks: {
          show: true,
        },
        labels: {
          format: 'MM-dd',
          show: true,
          style: {
            colors: this.colorsGrayGray500,
            fontSize: '12px',
            fontFamily: this.fontFamily,
          },
        },
        crosshairs: {
          show: true,
          position: 'front',
          stroke: {
            color: this.colorsGrayGray300,
            width: 1,
            dashArray: 3,
          },
        },
      },
      yaxis: {
        // min: 0,
        // max: 50000,
        labels: {
          show: true,
          style: {
            //colors: this.colorsGrayGray500,
            fontSize: '12px',
            fontFamily: this.fontFamily,
          },
          formatter: function (val) {
            return '$' + Number.parseFloat(val).toFixed(0)
          }
        },
      },
      states: {
        normal: {
          filter: {
            type: 'none',
            value: 0,
          },
        },
        hover: {
          filter: {
            type: 'none',
            value: 0,
          },
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'none',
            value: 0,
          },
        },
      },
      tooltip: {
        style: {
          fontSize: '12px',
          fontFamily: this.fontFamily,
        },
        y: {
          // tslint:disable-next-line
          formatter: function (val) {
            return '$' + Number.parseFloat(val).toFixed(2)
          },
        },
        marker: {
          show: true,
        },
      },
      //colors: ['transparent'],
      markers: {
        // colors: this.colorsThemeBaseDanger,
        // strokeColor: [strokeColor],
        strokeWidth: 2,
      },
    };
  }

  getSubChartOptions(subChart: { revenuePerDay: any; revenueBeforePerDay: any; datesOfRevenue: any; statType: any; redirectUri: any; revenueBeforeSum: any; revenueCurrentSum: any; }) {
    return {
      colors: ["#00A19F", "#919EAB"],
      series: [
        {
          name: moment().utc().startOf("day").subtract(30, "days").format("MMM DD") + " , " + moment().utc().startOf("day").subtract(30, "days").format("YYYY") + " - " + moment().utc().startOf("day").format("MMM DD") + " , " + moment().utc().startOf("day").format("YYYY"),
          data: subChart.revenuePerDay
        },
        {
          name: moment().utc().startOf("day").subtract(61, "days").format("MMM DD") + " , " + moment().utc().startOf("day").subtract(60, "days").format("YYYY") + " - " + moment().utc().startOf("day").subtract(31, "days").format("MMM DD") + " , " + moment().utc().startOf("day").subtract(30, "days").format("YYYY"),
          data: subChart.revenueBeforePerDay
        }
      ],
      chart: {
        height: 250,
        type: "area",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: true,
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 3,
        curve: "smooth",
        dashArray: [0, 3, 3]
      },
      xaxis: {
        type: "datetime",
        categories: subChart.datesOfRevenue,
        labels: {
          format: 'MM-dd'
        },
        axisTicks: {
          show: true,
        },
      },
      yaxis: {
        labels: {
          formatter: function (val: string) {
            return '$' + Number.parseFloat(val).toFixed(0)
          }
        },
      },
      tooltip: {
        y: {
          formatter: function (val: string) {
            return '$' + Number.parseFloat(val).toFixed(2)
          }
        }
      },

      statType: subChart.statType,
      redirectUri: subChart.redirectUri,
      revenueBeforeSum: subChart.revenueBeforeSum,
      revenueCurrentSum: subChart.revenueCurrentSum,
    };
  }

  getChartData(allChartData: any) {
    // our logic to group the posts by category
    if (!allChartData) return;

    var result = allChartData;

    return result;
  }
}
