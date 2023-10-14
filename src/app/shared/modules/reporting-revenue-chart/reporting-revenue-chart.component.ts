import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import * as moment from 'moment';
import { ChartDataInterface } from '../../models/chartData.interface';

@Component({
  selector: 'app-reporting-revenue-chart',
  templateUrl: './reporting-revenue-chart.component.html',
  styleUrls: ['./reporting-revenue-chart.component.scss'],
})
export class ReportingRevenueChartComponent implements OnInit {
  @Input() chartData: ChartDataInterface;
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
      this.chartData.publisherName,
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
        this.chartData.publisherName,
        this.chartData.searchesPerDay
      );
    }
  }

  setChartOptions(
    maxRevenue,
    maxSearches,
    datesOfRevenue,
    revenueByDayArray,
    publisherNameArray,
    searchesPerDay
  ) {
    this.chartDom = document.getElementById('main')!;
    this.myChart = echarts.init(this.chartDom);
    const colors = ['#5470C6', '#91CC75'];
    let series = [];
    for (var subData of revenueByDayArray) {
      let publisherKey = Object.keys(subData)[0];
      if (publisherKey) {
        series.push(
          {
            name: publisherKey,
            type: 'bar',
            stack: 'Ad',
            // itemStyle: {color: '#7c2785'},
            data: subData[publisherKey].map((item) => parseFloat(item).toFixed(2)),
          },
        )
      }
    }
    
    this.option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: true,
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
        formatter: function (params) {
          var colorSpan = color => '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + color + '"></span>';
          let rez = '<p>' + params[0].axisValue + '</p>';
          let total = 0;
          params.forEach(item => {
              var xx = '<p>'   + colorSpan(item.color) + ' ' + item.seriesName + ':  $ ' + item.data + '</p>'
              rez += xx;
              total += parseFloat(item.data);
          });
          rez += '<p>'   + colorSpan('#fc345c') + ' ' + 'Total' + ':  $ ' + total.toFixed(2) + '</p>';
          return rez;
      } 
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
        data: publisherNameArray,
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
        // {
        //   type: 'value',
        //   name: 'Searches',
        //   // min: 0,
        //   // max: maxSearches,
        //   // interval: 100000,
        //   axisLabel: {
        //     formatter: '{value}',
        //   },
        //   axisLine: {
        //     show: true,
        //     lineStyle: {
        //       color: colors[1]
        //     }
        //   },
        // },
      ],
      series: series,
    };
    this.option && this.myChart.setOption(this.option, true);
    
    window.addEventListener('resize', this.myChart.resize);
  }

  convertTimeStampArryToDate(arr) {
    let newArray = [];
    for (let i = 0; i < arr.length; i++) {
      newArray.push(moment(arr[i]).format('MM-DD-YYYY'));
    }
    return newArray;
  }

  getChartData(chartData: ChartDataInterface) {
    // our logic to group the posts by category
    if (!chartData) return;

    var result = chartData;

    return result;
  }
}
