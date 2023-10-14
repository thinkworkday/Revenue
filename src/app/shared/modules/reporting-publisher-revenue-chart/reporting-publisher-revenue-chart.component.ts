import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import * as moment from 'moment';
import { PublisherChartDataInterface } from '../../models/publisher.charData.interface';

@Component({
  selector: 'app-reporting-publisher-revenue-chart',
  templateUrl: './reporting-publisher-revenue-chart.component.html',
  styleUrls: ['./reporting-publisher-revenue-chart.component.scss']
})
export class ReportingPublisherRevenueChartComponent implements OnInit {

  @Input() public chartData: PublisherChartDataInterface;
  //Chart setup variables
  chartDom;
  myChart;
  option;

  constructor() { }

  ngOnInit(): void {

    this.setChartOptions(5, 5, [0], [0], [0], [0]);
    this.chartData = this.getChartData(this.chartData);
    this.setChartOptions(
      30000,
      300000,
      this.chartData.datesOfRevenue,
      this.chartData.revenuePerDay,
      this.chartData.publisherRevenuePerDay,
      this.chartData.searchesPerDay
    );
  }

  ngOnChanges() {
    if (this.chartData) {
      this.chartData.datesOfRevenue = this.convertTimeStampArryToDate(
        this.chartData.datesOfRevenue
      );
      this.setChartOptions(
        30000,
        300000,
        this.chartData.datesOfRevenue,
        this.chartData.revenuePerDay,
        this.chartData.publisherRevenuePerDay,
        this.chartData.searchesPerDay
      );
    }
  }

  setChartOptions(
    maxRevenue,
    maxSearches,
    datesOfRevenue,
    revenueByDayArray,
    publisherRevenueByDayArray,
    searchesPerDay
  ) {
    this.chartDom = document.getElementById('publisher-main')!;
    this.myChart = echarts.init(this.chartDom);
    const colors = ['#5470C6', '#91CC75'];
    this.option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      legend: {
        data: ['Revenue', 'Publisher Revenue', 'Searches'],
      },
      xAxis: [
        {
          type: 'category',
          data: datesOfRevenue,
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Revenue',
          axisLabel: {
            formatter: '${value}',
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: colors[0]
            }
          },
        },

      ],
      series: [
        {
          name: 'Revenue',
          type: 'bar',
          stack: 'Ad',
          itemStyle: { color: '#7c2785' },
          data: publisherRevenueByDayArray.map((item) => parseFloat(item).toFixed(2)),
        },
        // {
        //   name: 'Searches',
        //   type: 'bar',
        //   stack: 'Ad',
        //   itemStyle: { color: '#f77308' },
        //   data: searchesPerDay,
        // },
      ],
    };
    this.option && this.myChart.setOption(this.option);
    window.addEventListener('resize', this.myChart.resize);
  }

  convertTimeStampArryToDate(arr) {
    let newArray = [];
    for (let i = 0; i < arr.length; i++) {
      newArray.push(moment(arr[i]).format('MM-DD-YYYY'));
    }
    return newArray;
  }

  getChartData(chartData: PublisherChartDataInterface) {
    if (!chartData) return;

    var result = chartData;

    return result;
  }

}
