import { Component, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TagInterface } from 'src/app/shared/models/tag.interface';
import { TagManagementService } from '../../tag-management/tag-management.service';
import { UsersService } from '../../../shared/service/users.service'
import { ChartDataInterface } from 'src/app/shared/models/chartData.interface';
import { PerionService } from 'src/app/shared/service/admin-stats/perion.service';
import { LyonService } from 'src/app/shared/service/admin-stats/lyon.service';
import { VerizonService } from 'src/app/shared/service/admin-stats/verizon.service';
import { RubiService } from 'src/app/shared/service/admin-stats/rubi.service';
import { SolexBCService } from 'src/app/shared/service/admin-stats/solexbc.service';
import { System1Service } from 'src/app/shared/service/admin-stats/system1.service';
import { ApptitudeService } from 'src/app/shared/service/admin-stats/apptitude.service';
import { ExportDataService } from 'src/app/shared/service/export-data.service';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-publisher',
  templateUrl: './publisher.component.html',
  styleUrls: ['./publisher.component.scss']
})
export class PublisherComponent implements AfterViewInit {
  @ViewChild('expandableTable') table: any;
  loadingIndicator = true;
  tagRows: any;
  //Sends chartData to ReportingRevenueChartComponent
  chartData: ChartDataInterface;
  selectedCompany: any;
  selectedAdvertiser: any;
  allChart: any;
  allPerionChart: any;
  allVerizonChart: any;
  allRubiChart: any;
  allSolexBCChart: any;
  allApptitudeChart: any;
  range = {
    startDate: '',
    endDate: '',
  };
  statData: any;
  allLyonStatData: any;
  allPerionStatData: any;
  allVerizonStatData: any;
  allRubiStatData: any;
  allSolexBCStatData: any;
  allApptitudeStatData: any;
  users: any;
  constructor(
    private route: ActivatedRoute,
    private tagManagementService: TagManagementService,
    private cdr: ChangeDetectorRef,
    private userService: UsersService,
    private perionService: PerionService,
    private lyonService: LyonService,
    private verizonService: VerizonService,
    private rubiService: RubiService,
    private solexbcService: SolexBCService,
    private system1Service: System1Service,
    private apptitudeService: ApptitudeService,
    private exportDataService: ExportDataService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private percentPipe: PercentPipe,
  ) {
    this.selectedCompany = this.getSelectedCompanyFromLocalStorage();
  }

  async ngAfterViewInit() {
    this.users = [
      {
        id: 1,
        firstName: 'Mark',
        lastName: 'Otto',
        handle: '@mdo'
      },
      {
        id: 2,
        firstName: 'Jacob',
        lastName: 'Thornton',
        handle: '@fat'
      },
      {
        id: 3,
        firstName: 'Larry',
        lastName: 'the Bird',
        handle: '@twitter'
      },
    ];
    this.route.params.subscribe(async routeParams => {
      this.statData = [];
      this.tagRows = await this.getTagInformation(routeParams.tagId);
      this.selectedAdvertiser = this.tagRows.advertiser;
      this.selectedCompany = this.tagRows.company;
      
      if (this.selectedAdvertiser == "lyons") {
        this.chartData = await this.getLyonChartMetrics(
          this.selectedCompany,
          this.range.startDate,
          this.range.endDate
        );
        this.statData = await this.getAllLyonStats(this.range.startDate, this.range.endDate, this.tagRows)

      } else if (this.selectedAdvertiser == "perion") {
        this.chartData = await this.getPerionChartMetrics(
          this.selectedCompany,
          this.range.startDate,
          this.range.endDate
        );
        this.statData = await this.getAllPerionStats(this.range.startDate, this.range.endDate, this.tagRows)
      } else if (this.selectedAdvertiser == "verizon-direct") {
        this.chartData = await this.getVerizonChartMetrics(
          this.selectedCompany,
          this.range.startDate,
          this.range.endDate
        );
        this.statData = await this.getAllVerizonStats(this.range.startDate, this.range.endDate, this.tagRows)
      } else if (this.selectedAdvertiser == "rubi") {
        this.chartData = await this.getRubiChartMetrics(
          this.selectedCompany,
          this.range.startDate,
          this.range.endDate
        );
        this.statData = await this.getRubiAllStats(this.range.startDate, this.range.endDate, this.tagRows)
      } else if (this.selectedAdvertiser == "solex-bc") {
        this.chartData = await this.getSolexBCChartMetrics(
          this.selectedCompany,
          this.range.startDate,
          this.range.endDate
        );
        this.statData = await this.getSolexBCAllStats(this.range.startDate, this.range.endDate, this.tagRows)
      } else if (this.selectedAdvertiser == "system1") {
        this.chartData = await this.getSystem1ChartMetrics(
          this.selectedCompany,
          this.range.startDate,
          this.range.endDate
        );
        this.statData = await this.getSystem1AllStats(this.range.startDate, this.range.endDate, this.tagRows)
      } else if (this.selectedAdvertiser == "apptitude") {
        this.chartData = await this.getApptitudeChartMetrics(
          this.selectedCompany,
          this.range.startDate,
          this.range.endDate
        );
        this.statData = await this.getApptitudePublisherStats(this.range.startDate, this.range.endDate, this.tagRows)
      }

      this.refreshTable();
    });

  }
  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }
  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }

  getTagInformation(id: any) {
    return this.tagManagementService.getOneTag(id).toPromise().then((response) => {
      return response;
    }).catch((error) => {
      return error;
    })
  }

  public async updateReportingFiltering(range) {
    // console.log('Update report filtering....');
    this.range = range;
    if (this.selectedAdvertiser == "lyons") {
      this.chartData = await this.getLyonChartMetrics(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.statData = await this.getAllLyonStats(this.range.startDate, this.range.endDate, this.tagRows)
    } else if (this.selectedAdvertiser == "perion") {
      this.chartData = await this.getPerionChartMetrics(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.statData = await this.getAllPerionStats(this.range.startDate, this.range.endDate, this.tagRows)
    } else if (this.selectedAdvertiser == "verizon-direct") {
      this.chartData = await this.getVerizonChartMetrics(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.statData = await this.getAllVerizonStats(this.range.startDate, this.range.endDate, this.tagRows)
    } else if (this.selectedAdvertiser == "rubi") {
      this.chartData = await this.getRubiChartMetrics(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.statData = await this.getRubiAllStats(this.range.startDate, this.range.endDate, this.tagRows);
    } else if (this.selectedAdvertiser == "solex-bc") {
      this.chartData = await this.getSolexBCChartMetrics(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.statData = await this.getSolexBCAllStats(this.range.startDate, this.range.endDate, this.tagRows)
    } else if (this.selectedAdvertiser == "system1") {
      this.chartData = await this.getSystem1ChartMetrics(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.statData = await this.getSystem1AllStats(this.range.startDate, this.range.endDate, this.tagRows)
    } else if (this.selectedAdvertiser == "apptitude") {
      this.chartData = await this.getApptitudeChartMetrics(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.statData = await this.getApptitudePublisherStats(this.range.startDate, this.range.endDate, this.tagRows)
    }

    this.refreshTable();
  }

  getLyonChartMetrics(company, startDate, endDate) {
    return this.lyonService.getAllPublisherStats(startDate, endDate).toPromise().then((response) => {
      this.allChart = response;
      var chartAllLyonStat = [];
      for (var tagSub of this.tagRows.subids) {
        if (tagSub['filterTag'] == "Contains") {
          chartAllLyonStat = chartAllLyonStat.concat(this.allChart.filter(stat => stat.subid.includes(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "StartsWith") {
          chartAllLyonStat = chartAllLyonStat.concat(this.allChart.filter(stat => stat.subid.startsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "EndsWith") {
          chartAllLyonStat = chartAllLyonStat.concat(this.allChart.filter(stat => stat.subid.endsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "ExactValue") {
          chartAllLyonStat = chartAllLyonStat.concat(this.allChart.filter(stat => stat.subid == tagSub['subid']))
        }
      }

      //duplicated remove
      let filter_data = chartAllLyonStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )
      // filter_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      // })
      filter_data = filter_data.slice().sort((a, b) => a.date - b.date);

      var helperChart = {};
      var resultChart = filter_data.reduce(function (r, o) {
        var key = o.date;
        if (!helperChart[key]) {
          helperChart[key] = Object.assign({}, o); // create a copy of o
          r.push(helperChart[key]);
        } else {
          helperChart[key].searches += parseInt(o.searches);
          if (o.revenue) {
            helperChart[key].revenue += o.revenue;
          }
        }
        return r;
      }, []);

      var revenuePerDayVal = [];
      var publisherRevenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var searchesPerDayVal = [];
      var chartDataValue = {};
      for (var resVal of resultChart) {
        revenuePerDayVal.push(0);
        publisherRevenuePerDayVal.push(resVal.revenue);
        datesOfRevenueVal.push(resVal.date);
        searchesPerDayVal.push(resVal.searches);
      }
      chartDataValue['revenuePerDay'] = revenuePerDayVal;
      chartDataValue['publisherRevenuePerDay'] = publisherRevenuePerDayVal;
      chartDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartDataValue['searchesPerDay'] = searchesPerDayVal;
      return chartDataValue;
    })
      .catch((error) => {
        return error;
      });

  }
  refreshTable() {
    this.cdr.markForCheck();
  }

  exportToCsv(): void {
    let exportCov = [];
    for (var statOne of this.statData) {
      let stat = {
        date: this.datePipe.transform(statOne.date, "dd MMM yyyy"),
        searches: statOne.searches,
        cpc: this.currencyPipe.transform(statOne.cpc ? statOne.cpc : 0),
        ctr: this.percentPipe.transform(statOne.ctr, "1.2-2"),
        revenue: statOne.revenue,
      };
      exportCov.push(stat);
    }
    this.exportDataService.exportToCsv(exportCov, this.tagRows.nickName ? this.tagRows.nickName : this.tagRows.name, ['date', 'searches', 'cpc', 'ctr', 'revenue']);
  }

  getPerionChartMetrics(company, startDate, endDate) {
    return this.perionService.getPerTagPerionStats(this.selectedCompany, startDate, endDate).toPromise().then((response) => {
      this.allPerionChart = response;
      var chartAllPerionStat = [];
      for (var tagSub of this.tagRows.subids) {
        if (tagSub['filterTag'] == "Contains") {
          chartAllPerionStat = chartAllPerionStat.concat(this.allPerionChart.filter(stat => stat.subid.includes(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "StartsWith") {
          chartAllPerionStat = chartAllPerionStat.concat(this.allPerionChart.filter(stat => stat.subid.startsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "EndsWith") {
          chartAllPerionStat = chartAllPerionStat.concat(this.allPerionChart.filter(stat => stat.subid.endsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "ExactValue") {
          chartAllPerionStat = chartAllPerionStat.concat(this.allPerionChart.filter(stat => stat.subid == tagSub['subid']))
        }
      }

      //duplicated remove
      let filter_data = chartAllPerionStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )
      filter_data = filter_data.slice().sort((a, b) => a.date - b.date);
      var helperChart = {};
      var resultChart = filter_data.reduce(function (r, o) {
        var key = o.date;
        if (!helperChart[key]) {
          helperChart[key] = Object.assign({}, o); // create a copy of o
          r.push(helperChart[key]);
        } else {
          helperChart[key].searches += parseInt(o.impressions);
          if (o.revenue) {
            helperChart[key].revenue += o.revenue;
          }
        }
        return r;
      }, []);

      var revenuePerDayVal = [];
      var publisherRevenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var searchesPerDayVal = [];
      var chartDataValue = {};
      for (var resVal of resultChart) {
        revenuePerDayVal.push(0);
        publisherRevenuePerDayVal.push(resVal.revenue);
        datesOfRevenueVal.push(resVal.date);
        searchesPerDayVal.push(resVal.impressions);
      }
      chartDataValue['revenuePerDay'] = revenuePerDayVal;
      chartDataValue['publisherRevenuePerDay'] = publisherRevenuePerDayVal;
      chartDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartDataValue['searchesPerDay'] = searchesPerDayVal;
      return chartDataValue;
    })
      .catch((error) => {
        return error;
      });
  }

  getAllPerionStats(startDate, endDate, tag) {
    return this.perionService.getPerTagPerionStats(this.selectedCompany, startDate, endDate).toPromise().then((response) => {
      this.allPerionStatData = response;
      var allPerionStat = [];
      for (var tagSub of tag.subids) {
        if (tagSub.filterTag == "Contains") {
          allPerionStat = allPerionStat.concat(this.allPerionStatData.filter(stat => stat.subid.includes(tagSub.subid)))
          allPerionStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : "No Publisher"
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "StartsWith") {
          allPerionStat = allPerionStat.concat(this.allPerionStatData.filter(stat => stat.subid.startsWith(tagSub.subid)))
          allPerionStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : "No Publisher"
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "EndsWith") {
          allPerionStat = allPerionStat.concat(this.allPerionStatData.filter(stat => stat.subid.endsWith(tagSub.subid)))
          allPerionStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : "No Publisher"
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "ExactValue") {
          allPerionStat = allPerionStat.concat(this.allPerionStatData.filter(stat => stat.subid == tagSub.subid))
          allPerionStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : "No Publisher"
            //stat.tagname = tag.name
          })
        }
      }

      //duplicated remove
      let filter_data = allPerionStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )
      // let filtered_data = allPerionStat.filter((obj, pos, arr) => {
      //   return arr
      //     .map(mapObj => mapObj._id)
      //     .indexOf(obj._id) == pos;
      // });
      // var helper = {};
      // var resultAll = filtered_data.reduce(function(prev, current) {
      //   var key = (current.date).toString() + '-' + current.subid;
      //   if(!helper[key]) {
      //     helper[key] = Object.assign({}, current); // create a copy of o
      //     prev.push(helper[key]);
      //   } else {
      //     helper[key].clicks += parseInt(current.clicks);
      //     if(current.revenue) {
      //       helper[key].revenue += current.revenue;
      //     }

      //     helper[key].split += parseInt(current.split);
      //   }

      //   return prev;
      // }, []);
      // return resultAll.slice().sort((a, b) => b.date - a.date);
      return filter_data.slice().sort((a, b) => b.date - a.date);
    })
      .catch((error) => {
        return error;
      });
  }
  getAllLyonStats(startDate, endDate, tag) {
    return this.lyonService.getAllPublisherStats(startDate, endDate).toPromise().then((response) => {
      this.allLyonStatData = response;
      var allLyonStat = [];
      for (var tagSub of tag.subids) {
        if (tagSub.filterTag == "Contains") {
          allLyonStat = allLyonStat.concat(this.allLyonStatData.filter(stat => stat.subid.includes(tagSub.subid)))
          allLyonStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "StartsWith") {
          allLyonStat = allLyonStat.concat(this.allLyonStatData.filter(stat => stat.subid.startsWith(tagSub.subid)))
          allLyonStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "EndsWith") {
          allLyonStat = allLyonStat.concat(this.allLyonStatData.filter(stat => stat.subid.endsWith(tagSub.subid)))
          allLyonStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "ExactValue") {
          allLyonStat = allLyonStat.concat(this.allLyonStatData.filter(stat => stat.subid == tagSub.subid))
          allLyonStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        }
      }

      //duplicated remove
      let filtered_data = allLyonStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )
      // var helper = {};
      // filtered_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      // })

      // var resultAll = filtered_data.reduce(function(prev, current) {
      //   var key = (current.rptDate).toString() + '-' + current.subid;
      //   if(!helper[key]) {
      //     helper[key] = Object.assign({}, current); // create a copy of o
      //     prev.push(helper[key]);
      //   } else {
      //     helper[key].clicks += parseInt(current.clicks);
      //     helper[key].searches += parseInt(current.searches);
      //     if(current.biddedCtr) {
      //       helper[key].biddedCtr += current.biddedCtr;
      //     }
      //     if(current.ctr) {
      //       helper[key].ctr += current.ctr;
      //     }
      //     if(current.revenue) {
      //       helper[key].revenue += current.revenue;
      //     }

      //     helper[key].biddedSearches += parseInt(current.biddedSearches);
      //     helper[key].split += parseInt(current.split);
      //   }

      //   return prev;
      // }, []);

      //return resultAll.slice().sort((a, b) => b.rptDate - a.rptDate);
      return filtered_data.slice().sort((a, b) => b.date - a.date);
    })
      .catch((error) => {
        return error;
      });
  }

  getAllVerizonStats(startDate, endDate, tag) {
    return this.verizonService.getAllPublisherVerizonStats(this.selectedCompany, startDate, endDate).toPromise().then((response) => {
      this.allVerizonStatData = response.stats;
      var allVerizonStat = [];
      for (var tagSub of tag.subids) {
        if (tagSub.filterTag == "Contains") {
          allVerizonStat = allVerizonStat.concat(this.allVerizonStatData.filter(stat => stat.subid.includes(tagSub.subid)))
          allVerizonStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "StartsWith") {
          allVerizonStat = allVerizonStat.concat(this.allVerizonStatData.filter(stat => stat.subid.startsWith(tagSub.subid)))
          allVerizonStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "EndsWith") {
          allVerizonStat = allVerizonStat.concat(this.allVerizonStatData.filter(stat => stat.subid.endsWith(tagSub.subid)))
          allVerizonStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "ExactValue") {
          allVerizonStat = allVerizonStat.concat(this.allVerizonStatData.filter(stat => stat.subid == tagSub.subid))
          allVerizonStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            stat.tagname = tag.name
          })
        }
      }
      //duplicated remove
      let filtered_data = allVerizonStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )

      // var helper = {};
      // filtered_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      // })


      return filtered_data.slice().sort((a, b) => b.date - a.date);
    })
      .catch((error) => {
        return error;
      });
  }
  getVerizonChartMetrics(company, startDate, endDate) {
    return this.verizonService.getAllPublisherVerizonStats(this.selectedCompany, startDate, endDate).toPromise().then((response) => {
      this.allVerizonChart = response.stats;
      var chartAllVerizonStat = [];
      for (var tagSub of this.tagRows.subids) {
        if (tagSub['filterTag'] == "Contains") {
          chartAllVerizonStat = chartAllVerizonStat.concat(this.allVerizonChart.filter(stat => stat.subid.includes(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "StartsWith") {
          chartAllVerizonStat = chartAllVerizonStat.concat(this.allVerizonChart.filter(stat => stat.subid.startsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "EndsWith") {
          chartAllVerizonStat = chartAllVerizonStat.concat(this.allVerizonChart.filter(stat => stat.subid.endsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "ExactValue") {
          chartAllVerizonStat = chartAllVerizonStat.concat(this.allVerizonChart.filter(stat => stat.subid == tagSub['subid']))
        }
      }

      //duplicated remove
      let filter_data = chartAllVerizonStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )
      // filter_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      // })
      filter_data = filter_data.slice().sort((a, b) => a.date - b.date);

      var helperChart = {};
      var resultChart = filter_data.reduce(function (r, o) {
        var key = o.date;
        if (!helperChart[key]) {
          helperChart[key] = Object.assign({}, o); // create a copy of o
          r.push(helperChart[key]);
        } else {
          helperChart[key].searches += parseInt(o.searches);
          if (o.revenue) {
            helperChart[key].revenue += o.revenue;
          }
        }
        return r;
      }, []);

      var revenuePerDayVal = [];
      var publisherRevenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var searchesPerDayVal = [];
      var chartDataValue = {};
      for (var resVal of resultChart) {
        revenuePerDayVal.push(0);
        publisherRevenuePerDayVal.push(resVal.revenue);
        datesOfRevenueVal.push(resVal.date);
        searchesPerDayVal.push(resVal.searches);
      }
      chartDataValue['revenuePerDay'] = revenuePerDayVal;
      chartDataValue['publisherRevenuePerDay'] = publisherRevenuePerDayVal;
      chartDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartDataValue['searchesPerDay'] = searchesPerDayVal;
      return chartDataValue;
    })
      .catch((error) => {
        return error;
      });

  }
  getRubiAllStats(startDate, endDate, tag) {
    return this.rubiService.getAllRubiStats(this.selectedCompany, startDate, endDate).toPromise().then((res) => {
      this.allRubiStatData = res.stats;
      var allRubiStat = [];
      for (var tagSub of tag.subids) {
        if (tagSub.filterTag == "Contains") {
          allRubiStat = allRubiStat.concat(this.allRubiStatData.filter(stat => stat.subid.includes(tagSub.subid)))
          allRubiStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "StartsWith") {
          allRubiStat = allRubiStat.concat(this.allRubiStatData.filter(stat => stat.subid.startsWith(tagSub.subid)))
          allRubiStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "EndsWith") {
          allRubiStat = allRubiStat.concat(this.allRubiStatData.filter(stat => stat.subid.endsWith(tagSub.subid)))
          allRubiStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "ExactValue") {
          allRubiStat = allRubiStat.concat(this.allRubiStatData.filter(stat => stat.subid == tagSub.subid))
          allRubiStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        }
      }
      //duplicated remove
      let filtered_data = allRubiStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )

      // // var helper = {};
      // filtered_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      //   f.cpc = parseFloat(f.revenue)/parseFloat(f.clicks);
      // })


      return filtered_data.slice().sort((a, b) => b.date - a.date);
    })
      .catch((error) => {
        return error;
      });
  }
  getRubiChartMetrics(company, startDate, endDate) {
    return this.rubiService.getAllRubiStats(this.selectedCompany, startDate, endDate).toPromise().then((response) => {
      this.allRubiChart = response.stats;
      var chartAllRubiStat = [];
      for (var tagSub of this.tagRows.subids) {
        if (tagSub['filterTag'] == "Contains") {
          chartAllRubiStat = chartAllRubiStat.concat(this.allRubiChart.filter(stat => stat.subid.includes(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "StartsWith") {
          chartAllRubiStat = chartAllRubiStat.concat(this.allRubiChart.filter(stat => stat.subid.startsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "EndsWith") {
          chartAllRubiStat = chartAllRubiStat.concat(this.allRubiChart.filter(stat => stat.subid.endsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "ExactValue") {
          chartAllRubiStat = chartAllRubiStat.concat(this.allRubiChart.filter(stat => stat.subid == tagSub['subid']))
        }
      }

      //duplicated remove
      let filter_data = chartAllRubiStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )
      // filter_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      // })
      filter_data = filter_data.slice().sort((a, b) => a.date - b.date);

      var helperChart = {};
      var resultChart = filter_data.reduce(function (r, o) {
        var key = o.date;
        if (!helperChart[key]) {
          helperChart[key] = Object.assign({}, o); // create a copy of o
          r.push(helperChart[key]);
        } else {
          helperChart[key].searches += parseInt(o.searches);
          if (o.revenue) {
            helperChart[key].revenue += o.revenue;
          }
        }
        return r;
      }, []);

      var revenuePerDayVal = [];
      var publisherRevenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var searchesPerDayVal = [];
      var chartDataValue = {};
      for (var resVal of resultChart) {
        revenuePerDayVal.push(0);
        publisherRevenuePerDayVal.push(resVal.revenue);
        datesOfRevenueVal.push(resVal.date);
        searchesPerDayVal.push(resVal.searches);
      }
      chartDataValue['revenuePerDay'] = revenuePerDayVal;
      chartDataValue['publisherRevenuePerDay'] = publisherRevenuePerDayVal;
      chartDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartDataValue['searchesPerDay'] = searchesPerDayVal;
      return chartDataValue;
    })
      .catch((error) => {
        return error;
      });

  }
  getSolexBCAllStats(startDate, endDate, tag) {
    return this.solexbcService.getAllSolexBCStats(this.selectedCompany, startDate, endDate).toPromise().then((res) => {
      this.allSolexBCStatData = res.stats;
      var allSolexBCStat = [];
      for (var tagSub of tag.subids) {
        if (tagSub.filterTag == "Contains") {
          allSolexBCStat = allSolexBCStat.concat(this.allSolexBCStatData.filter(stat => stat.subid.includes(tagSub.subid)))
          allSolexBCStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "StartsWith") {
          allSolexBCStat = allSolexBCStat.concat(this.allSolexBCStatData.filter(stat => stat.subid.startsWith(tagSub.subid)))
          allSolexBCStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "EndsWith") {
          allSolexBCStat = allSolexBCStat.concat(this.allSolexBCStatData.filter(stat => stat.subid.endsWith(tagSub.subid)))
          allSolexBCStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "ExactValue") {
          allSolexBCStat = allSolexBCStat.concat(this.allSolexBCStatData.filter(stat => stat.subid == tagSub.subid))
          allSolexBCStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        }
      }
      //duplicated remove
      let filtered_data = allSolexBCStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )

      // // var helper = {};
      // filtered_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      //   f.cpc = parseFloat(f.revenue)/parseFloat(f.clicks);
      // })


      return filtered_data.slice().sort((a, b) => b.date - a.date);
    })
      .catch((error) => {
        return error;
      });
  }
  getSolexBCChartMetrics(company, startDate, endDate) {
    return this.solexbcService.getAllSolexBCStats(this.selectedCompany, startDate, endDate).toPromise().then((response) => {
      this.allSolexBCChart = response.stats;
      var chartAllSolexbcStat = [];
      for (var tagSub of this.tagRows.subids) {
        if (tagSub['filterTag'] == "Contains") {
          chartAllSolexbcStat = chartAllSolexbcStat.concat(this.allSolexBCChart.filter(stat => stat.subid.includes(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "StartsWith") {
          chartAllSolexbcStat = chartAllSolexbcStat.concat(this.allSolexBCChart.filter(stat => stat.subid.startsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "EndsWith") {
          chartAllSolexbcStat = chartAllSolexbcStat.concat(this.allSolexBCChart.filter(stat => stat.subid.endsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "ExactValue") {
          chartAllSolexbcStat = chartAllSolexbcStat.concat(this.allSolexBCChart.filter(stat => stat.subid == tagSub['subid']))
        }
      }

      //duplicated remove
      let filter_data = chartAllSolexbcStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )
      // filter_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      // })
      filter_data = filter_data.slice().sort((a, b) => a.date - b.date);

      var helperChart = {};
      var resultChart = filter_data.reduce(function (r, o) {
        var key = o.date;
        if (!helperChart[key]) {
          helperChart[key] = Object.assign({}, o); // create a copy of o
          r.push(helperChart[key]);
        } else {
          helperChart[key].searches += parseInt(o.searches);
          if (o.revenue) {
            helperChart[key].revenue += o.revenue;
          }
        }
        return r;
      }, []);

      var revenuePerDayVal = [];
      var publisherRevenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var searchesPerDayVal = [];
      var chartDataValue = {};
      for (var resVal of resultChart) {
        revenuePerDayVal.push(0);
        publisherRevenuePerDayVal.push(resVal.revenue);
        datesOfRevenueVal.push(resVal.date);
        searchesPerDayVal.push(resVal.searches);
      }
      chartDataValue['revenuePerDay'] = revenuePerDayVal;
      chartDataValue['publisherRevenuePerDay'] = publisherRevenuePerDayVal;
      chartDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartDataValue['searchesPerDay'] = searchesPerDayVal;
      return chartDataValue;
    })
      .catch((error) => {
        return error;
      });

  }

  getSystem1AllStats(startDate, endDate, tag) {
    return this.system1Service.getSystem1PublisherStats(this.selectedCompany, startDate, endDate).toPromise().then((res) => {
      this.allSolexBCStatData = res.stats;
      var allSolexBCStat = [];
      for (var tagSub of tag.subids) {
        if (tagSub.filterTag == "Contains") {
          allSolexBCStat = allSolexBCStat.concat(this.allSolexBCStatData.filter(stat => stat.subid.includes(tagSub.subid)))
          allSolexBCStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "StartsWith") {
          allSolexBCStat = allSolexBCStat.concat(this.allSolexBCStatData.filter(stat => stat.subid.startsWith(tagSub.subid)))
          allSolexBCStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "EndsWith") {
          allSolexBCStat = allSolexBCStat.concat(this.allSolexBCStatData.filter(stat => stat.subid.endsWith(tagSub.subid)))
          allSolexBCStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "ExactValue") {
          allSolexBCStat = allSolexBCStat.concat(this.allSolexBCStatData.filter(stat => stat.subid == tagSub.subid))
          allSolexBCStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        }
      }
      //duplicated remove
      let filtered_data = allSolexBCStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )

      // // var helper = {};
      // filtered_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      //   f.cpc = parseFloat(f.revenue)/parseFloat(f.clicks);
      // })


      return filtered_data.slice().sort((a, b) => b.date - a.date);
    })
      .catch((error) => {
        return error;
      });
  }
  getSystem1ChartMetrics(company, startDate, endDate) {
    return this.system1Service.getSystem1PublisherStats(this.selectedCompany, startDate, endDate).toPromise().then((response) => {
      this.allSolexBCChart = response.stats;
      var chartAllSolexbcStat = [];
      for (var tagSub of this.tagRows.subids) {
        if (tagSub['filterTag'] == "Contains") {
          chartAllSolexbcStat = chartAllSolexbcStat.concat(this.allSolexBCChart.filter(stat => stat.subid.includes(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "StartsWith") {
          chartAllSolexbcStat = chartAllSolexbcStat.concat(this.allSolexBCChart.filter(stat => stat.subid.startsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "EndsWith") {
          chartAllSolexbcStat = chartAllSolexbcStat.concat(this.allSolexBCChart.filter(stat => stat.subid.endsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "ExactValue") {
          chartAllSolexbcStat = chartAllSolexbcStat.concat(this.allSolexBCChart.filter(stat => stat.subid == tagSub['subid']))
        }
      }

      //duplicated remove
      let filter_data = chartAllSolexbcStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )
      // filter_data.map(f =>{
      //   f.revenue = parseFloat(f.revenue) * parseFloat(f.split)/100;
      // })
      filter_data = filter_data.slice().sort((a, b) => a.date - b.date);

      var helperChart = {};
      var resultChart = filter_data.reduce(function (r, o) {
        var key = o.date;
        if (!helperChart[key]) {
          helperChart[key] = Object.assign({}, o); // create a copy of o
          r.push(helperChart[key]);
        } else {
          helperChart[key].searches += parseInt(o.searches);
          if (o.revenue) {
            helperChart[key].revenue += o.revenue;
          }
        }
        return r;
      }, []);

      var revenuePerDayVal = [];
      var publisherRevenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var searchesPerDayVal = [];
      var chartDataValue = {};
      for (var resVal of resultChart) {
        revenuePerDayVal.push(0);
        publisherRevenuePerDayVal.push(resVal.revenue);
        datesOfRevenueVal.push(resVal.date);
        searchesPerDayVal.push(resVal.searches);
      }
      chartDataValue['revenuePerDay'] = revenuePerDayVal;
      chartDataValue['publisherRevenuePerDay'] = publisherRevenuePerDayVal;
      chartDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartDataValue['searchesPerDay'] = searchesPerDayVal;
      return chartDataValue;
    })
      .catch((error) => {
        return error;
      });

  }

  getApptitudePublisherStats(startDate, endDate, tag) {
    return this.apptitudeService.getPublisherApptitudeStats(this.selectedCompany, startDate, endDate).toPromise().then((res) => {
      this.allApptitudeStatData = res.stats;
      var allApptitudeStat = [];
      for (var tagSub of tag.subids) {
        if (tagSub.filterTag == "Contains") {
          allApptitudeStat = allApptitudeStat.concat(this.allApptitudeStatData.filter(stat => stat.subid.includes(tagSub.subid)))
          allApptitudeStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "StartsWith") {
          allApptitudeStat = allApptitudeStat.concat(this.allApptitudeStatData.filter(stat => stat.subid.startsWith(tagSub.subid)))
          allApptitudeStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "EndsWith") {
          allApptitudeStat = allApptitudeStat.concat(this.allApptitudeStatData.filter(stat => stat.subid.endsWith(tagSub.subid)))
          allApptitudeStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        } else if (tagSub.filterTag == "ExactValue") {
          allApptitudeStat = allApptitudeStat.concat(this.allApptitudeStatData.filter(stat => stat.subid == tagSub.subid))
          allApptitudeStat.map(stat => {
            stat.publisher = tag.publisher ? tag.publisher.fullname : ""
            // stat.tagname = tag.name
          })
        }
      }
      //duplicated remove
      let filtered_data = allApptitudeStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )

      return filtered_data.slice().sort((a, b) => b.date - a.date);
    })
      .catch((error) => {
        return error;
      });
  }
  getApptitudeChartMetrics(company, startDate, endDate) {
    return this.apptitudeService.getPublisherApptitudeStats(this.selectedCompany, startDate, endDate).toPromise().then((response) => {
      this.allApptitudeChart = response.stats;
      var chatAllApptitudeStat = [];
      for (var tagSub of this.tagRows.subids) {
        if (tagSub['filterTag'] == "Contains") {
          chatAllApptitudeStat = chatAllApptitudeStat.concat(this.allApptitudeChart.filter(stat => stat.subid.includes(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "StartsWith") {
          chatAllApptitudeStat = chatAllApptitudeStat.concat(this.allApptitudeChart.filter(stat => stat.subid.startsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "EndsWith") {
          chatAllApptitudeStat = chatAllApptitudeStat.concat(this.allApptitudeChart.filter(stat => stat.subid.endsWith(tagSub['subid'])))
        } else if (tagSub['filterTag'] == "ExactValue") {
          chatAllApptitudeStat = chatAllApptitudeStat.concat(this.allApptitudeChart.filter(stat => stat.subid == tagSub['subid']))
        }
      }

      //duplicated remove
      let filter_data = chatAllApptitudeStat.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.date === thing.date && t.subid === thing.subid
        ))
      )
      filter_data = filter_data.slice().sort((a, b) => a.date - b.date);

      var helperChart = {};
      var resultChart = filter_data.reduce(function (r, o) {
        var key = o.date;
        if (!helperChart[key]) {
          helperChart[key] = Object.assign({}, o); // create a copy of o
          r.push(helperChart[key]);
        } else {
          helperChart[key].searches += parseInt(o.searches);
          if (o.revenue) {
            helperChart[key].revenue += o.revenue;
          }
        }
        return r;
      }, []);

      var revenuePerDayVal = [];
      var publisherRevenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var searchesPerDayVal = [];
      var chartDataValue = {};
      for (var resVal of resultChart) {
        revenuePerDayVal.push(0);
        publisherRevenuePerDayVal.push(resVal.revenue);
        datesOfRevenueVal.push(resVal.date);
        searchesPerDayVal.push(resVal.searches);
      }
      chartDataValue['revenuePerDay'] = revenuePerDayVal;
      chartDataValue['publisherRevenuePerDay'] = publisherRevenuePerDayVal;
      chartDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartDataValue['searchesPerDay'] = searchesPerDayVal;
      return chartDataValue;
    })
      .catch((error) => {
        return error;
      });

  }
}
