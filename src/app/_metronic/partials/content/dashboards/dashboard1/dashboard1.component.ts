import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { LayoutService } from '../../../../core';
import { PerionService } from 'src/app/shared/service/admin-stats/perion.service';
import { UsersService } from 'src/app/shared/service/users.service'
import { LyonService } from 'src/app/shared/service/admin-stats/lyon.service';
import { RubiService } from 'src/app/shared/service/admin-stats/rubi.service';
import { SolexBCService } from 'src/app/shared/service/admin-stats/solexbc.service';
import { System1Service } from 'src/app/shared/service/admin-stats/system1.service';
import { VerizonService } from 'src/app/shared/service/admin-stats/verizon.service';
import { TagManagementService } from 'src/app/modules/tag-management/tag-management.service';
import { CompanyManagementService } from 'src/app/modules/company-management/company-management.service';
import * as moment from 'moment';
import { AuthService } from 'src/app/modules/auth/_services/auth.service';
import { ApptitudeService } from 'src/app/shared/service/admin-stats/apptitude.service';
import { HopkinService } from 'src/app/shared/service/admin-stats/hopkin.service';

@Component({
  selector: 'app-dashboard1',
  templateUrl: './dashboard1.component.html',
})
export class Dashboard1Component implements AfterViewInit {

  perionChartData: any;
  selectedCompany: any;
  allLyonChart: any;
  allPerionChart: any;
  allRubiChart: any;
  allSystem1Chart: any;
  allVerizonChart: any;
  allSolexBCChart: any;
  allApptitudeChart: any;
  allHopkinChart: any;
  tagList: any = [];
  lyonChartData: any;
  rubiChartData: any;
  system1ChartData: any;
  solexbcChartData: any;
  apptitudeChartData: any;
  hopkinChartData: any;
  ChartData: any;
  tempChartData: any = [];
  allDaysList: any = [];
  verizonChartData: any;
  reportTypeData: any = [];
  companyName = "";
  pagePermission = true;

  constructor(
    private authService: AuthService,
    private perionService: PerionService,
    private userService: UsersService,
    private cdr: ChangeDetectorRef,
    private lyonService: LyonService,
    private rubiService: RubiService,
    private verizonService: VerizonService,
    private tagService: TagManagementService,
    private system1Service: System1Service,
    private companyService: CompanyManagementService,
    private solexbcService: SolexBCService,
    private apptitudeService: ApptitudeService,
    private hopkinService: HopkinService,
  ) { }

  async ngAfterViewInit() {
    const currentUser = this.authService.currentUserValue;
    var dashboardPermission = currentUser.permission[0]["dashboard"];

    if (dashboardPermission && currentUser.permission[0]['role'] != '3') {
      this.pagePermission = true;
      this.selectedCompany = this.getSelectedCompanyFromLocalStorage();
      this.reportTypeData = await this.getReportingProviderList();
      this.allDaysList = this.getCurrentMontDateList();
      this.tagList = await this.getCompanyTags(this.selectedCompany);
      this.perionChartData = await this.getPerionChart(this.selectedCompany);
      this.lyonChartData = await this.getLyonChart(this.selectedCompany);
      this.rubiChartData = await this.getRubiChart(this.selectedCompany);
      this.verizonChartData = await this.getVerizonChart(this.selectedCompany);
      this.system1ChartData = await this.getSystem1Chart(this.selectedCompany);
      this.solexbcChartData = await this.getSolexBCChart(this.selectedCompany);
      this.apptitudeChartData = await this.getApptitudeChart(this.selectedCompany);
      this.hopkinChartData = await this.getHopkinChart(this.selectedCompany);

      if (this.reportTypeData.includes('perion')) {
        this.tempChartData = this.tempChartData.concat(this.perionChartData)
      }
      if (this.reportTypeData.includes('lyons')) {
        this.tempChartData = this.tempChartData.concat(this.lyonChartData)
      }
      if (this.reportTypeData.includes('rubi')) {
        this.tempChartData = this.tempChartData.concat(this.rubiChartData)
      }
      if (this.reportTypeData.includes('verizon-direct')) {
        this.tempChartData = this.tempChartData.concat(this.verizonChartData)
      }
      if (this.reportTypeData.includes('system1')) {
        this.tempChartData = this.tempChartData.concat(this.system1ChartData)
      }
      if (this.reportTypeData.includes('solex-bc')) {
        this.tempChartData = this.tempChartData.concat(this.solexbcChartData)
      }
      if (this.reportTypeData.includes('apptitude')) {
        this.tempChartData = this.tempChartData.concat(this.apptitudeChartData)
      }
      if (this.reportTypeData.includes('hopkins')) {
        this.tempChartData = this.tempChartData.concat(this.hopkinChartData)
      }
      this.ChartData = this.tempChartData;
    } else {
      this.pagePermission = false;
    }

    this.cdr.markForCheck();
  }

  //get Report Providers in Current Company
  async getReportingProviderList() {
    if (this.selectedCompany) {
      try {
        const res = await this.companyService.getReportCompany(this.selectedCompany.split('/')[1]).toPromise();
        this.companyName = res.name;
        var providerList = [];
        res.reportingProviders.map(report => {
          providerList.push(report.reportingProvider);
        });
        return providerList;
      } catch (error) {
        return error;
      };
    }
  }

  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  async getPerionChart(company: string) {
    try {
      const response = await this.perionService
        .getAllDashboardStats(company)
        .toPromise();
      this.allPerionChart = response[0];
      var chartPerionMetric = [];
      var chartAllPerionStat = this.allPerionChart.currentStat;
      var chartAllBeforePerionStat = this.allPerionChart.beforeStat;

      // for (var tagL of this.tagList) {
      //   var chartAllPerionStat = [];
      //   var chartAllBeforePerionStat = [];
      //   if(tagL.tag.advertiser == 'perion') {
      //     for(var tagSub of tagL.tag.subids) {
      //       if(tagSub['filterTag'] =="Contains") {   
      //         chartAllPerionStat = chartAllPerionStat.concat(this.allPerionChart.currentStat.filter(stat => stat.subid.includes(tagSub['subid'])))
      //         chartAllBeforePerionStat = chartAllBeforePerionStat.concat(this.allPerionChart.beforeStat.filter(stat => stat.subid.includes(tagSub['subid'])))
      //       } else if (tagSub['filterTag'] =="StartsWith") {
      //         chartAllPerionStat = chartAllPerionStat.concat(this.allPerionChart.currentStat.filter(stat => stat.subid.startsWith(tagSub['subid'])))
      //         chartAllBeforePerionStat = chartAllBeforePerionStat.concat(this.allPerionChart.beforeStat.filter(stat => stat.subid.startsWith(tagSub['subid'])))
      //       } else if (tagSub['filterTag'] =="EndsWith") {
      //         chartAllPerionStat = chartAllPerionStat.concat(this.allPerionChart.currentStat.filter(stat => stat.subid.endsWith(tagSub['subid'])))
      //         chartAllBeforePerionStat = chartAllBeforePerionStat.concat(this.allPerionChart.beforeStat.filter(stat => stat.subid.endsWith(tagSub['subid'])))
      //       } else if (tagSub['filterTag'] =="ExactValue") {
      //         chartAllPerionStat = chartAllPerionStat.concat(this.allPerionChart.currentStat.filter(stat => stat.subid == tagSub['subid'] ))
      //         chartAllBeforePerionStat = chartAllBeforePerionStat.concat(this.allPerionChart.beforeStat.filter(stat => stat.subid == tagSub['subid'] ))
      //       }
      //     }
      //   }
      // }
      //duplicated remove
      // let filter_data = chartAllPerionStat.filter((obj, pos, arr) => {
      //   return arr
      //     .map(mapObj => mapObj._id)
      //     .indexOf(obj._id) == pos;
      // });
      chartAllPerionStat = chartAllPerionStat.slice().sort((a, b) => a.date - b.date);
      chartAllBeforePerionStat = chartAllBeforePerionStat.slice().sort((a_1, b_1) => a_1.date - b_1.date);
      // var helperChart = {};
      // chartAllPerionStat.map(f =>{
      //   f.revenue = parseFloat(f.revenue);
      // })
      // var resultChart = chartAllPerionStat.reduce(function(r, o) {
      //   var key = o.date;
      //   if(!helperChart[key]) {
      //     helperChart[key] = Object.assign({}, o); // create a copy of o
      //     r.push(helperChart[key]);
      //   } else {
      //     helperChart[key].bing_searches_initial += parseInt(o.bing_searches_initial);
      //     if(o.revenue) {
      //       helperChart[key].revenue += o.revenue;
      //     }
      //   } 
      //   return r;
      // }, []);
      //duplicated remove Before Month Data
      // let filter_before_data = chartAllBeforePerionStat.filter((obj, pos, arr) => {
      //   return arr
      //     .map(mapObj => mapObj._id)
      //     .indexOf(obj._id) == pos;
      // });
      // var helperBeforeChart = {};
      // chartAllBeforePerionStat.map(f =>{
      //   f.revenue = parseFloat(f.revenue);
      // })
      // var resultBeforeChart = chartAllBeforePerionStat.reduce(function(r, o) {
      //   var key = o.date;
      //   if(!helperBeforeChart[key]) {
      //     helperBeforeChart[key] = Object.assign({}, o); // create a copy of o
      //     r.push(helperBeforeChart[key]);
      //   } else {
      //     helperBeforeChart[key].bing_searches_initial += parseInt(o.bing_searches_initial);
      //     if(o.revenue) {
      //       helperBeforeChart[key].revenue += o.revenue;
      //     }
      //   } 
      //   return r;
      // }, []);
      var revenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var revenuePerDayBeforeVal = [];
      var datesOfRevenueBeforeVal = [];
      var chartPerionDataValue = {};
      var revenueCurrentSum = 0;
      var revenueBeforeSum = 0;

      for (var dayData of this.allDaysList) {
        var checkExistDay = chartAllPerionStat.filter((result) => result.date == dayData);
        if (checkExistDay.length == 0) {
          revenuePerDayVal.push(0);
          datesOfRevenueVal.push(dayData);
        } else {
          for (var resVal of checkExistDay) {
            revenueCurrentSum += resVal.revenue;
            revenuePerDayVal.push(resVal.revenue);
            datesOfRevenueVal.push(resVal.date);
          }
        }
      }

      for (var resBeforeVal of chartAllBeforePerionStat) {
        revenueBeforeSum += resBeforeVal.revenue;
        revenuePerDayBeforeVal.push(resBeforeVal.revenue);
        datesOfRevenueBeforeVal.push(resBeforeVal.date);
      }

      chartPerionDataValue['revenuePerDay'] = revenuePerDayVal;
      chartPerionDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartPerionDataValue['revenueBeforePerDay'] = revenuePerDayBeforeVal;
      chartPerionDataValue['datesOfRevenueBefore'] = datesOfRevenueBeforeVal;
      chartPerionDataValue['revenueCurrentSum'] = Number.parseFloat(revenueCurrentSum.toFixed(2));
      chartPerionDataValue['revenueBeforeSum'] = Number.parseFloat(revenueBeforeSum.toFixed(2));
      chartPerionDataValue['statType'] = "Perion";
      chartPerionDataValue['redirectUri'] = "/reporting/perion";
      chartPerionMetric.push(chartPerionDataValue);
      return chartPerionMetric;
    } catch (error) {
      return error;
    }
  }
  async getLyonChart(company: string) {
    try {
      const response = await this.lyonService.getAllDashboardStats().toPromise();
      this.allLyonChart = response[0];
      // console.log("=======dddd======", this.allLyonChart)
      var chartLyonMetric = [];
      var chartAllLyonStat = this.allLyonChart.currentStat;
      var chartAllBeforeLyonStat = this.allLyonChart.beforeStat;
      // for (var tagL of this.tagList) {
      //   if(tagL.tag.advertiser == 'lyons') {
      //     for(var tagSub of tagL.tag.subids) {
      //       if(tagSub['filterTag'] =="Contains") {   
      //         chartAllLyonStat = chartAllLyonStat.concat(this.allLyonChart.currentStat.filter(stat => stat.subid.includes(tagSub['subid'])))
      //         chartAllBeforeLyonStat = chartAllBeforeLyonStat.concat(this.allLyonChart.beforeStat.filter(stat => stat.subid.includes(tagSub['subid'])))
      //       } else if (tagSub['filterTag'] =="StartsWith") {
      //         chartAllLyonStat = chartAllLyonStat.concat(this.allLyonChart.currentStat.filter(stat => stat.subid.startsWith(tagSub['subid'])))
      //         chartAllBeforeLyonStat = chartAllBeforeLyonStat.concat(this.allLyonChart.beforeStat.filter(stat => stat.subid.startsWith(tagSub['subid'])))
      //       } else if (tagSub['filterTag'] =="EndsWith") {
      //         chartAllLyonStat = chartAllLyonStat.concat(this.allLyonChart.currentStat.filter(stat => stat.subid.endsWith(tagSub['subid'])))
      //         chartAllBeforeLyonStat = chartAllBeforeLyonStat.concat(this.allLyonChart.beforeStat.filter(stat => stat.subid.endsWith(tagSub['subid'])))
      //       } else if (tagSub['filterTag'] =="ExactValue") {
      //         chartAllLyonStat = chartAllLyonStat.concat(this.allLyonChart.currentStat.filter(stat => stat.subid == tagSub['subid'] ))
      //         chartAllBeforeLyonStat = chartAllBeforeLyonStat.concat(this.allLyonChart.beforeStat.filter(stat => stat.subid == tagSub['subid'] ))
      //       }
      //     }
      //   }
      // }
      // //duplicated remove
      // let filter_data = chartAllLyonStat.filter((obj, pos, arr) => {
      //   return arr
      //     .map(mapObj => mapObj._id)
      //     .indexOf(obj._id) == pos;
      // });
      chartAllLyonStat = chartAllLyonStat.slice().sort((a, b) => a.date - b.date);
      chartAllBeforeLyonStat = chartAllBeforeLyonStat.slice().sort((a_1, b_1) => a_1.date - b_1.date);
      // var helperChart = {};
      // var resultChart = chartAllLyonStat.reduce(function(r, o) {
      //   var key = o.date;
      //   if(!helperChart[key]) {
      //     helperChart[key] = Object.assign({}, o); // create a copy of o
      //     r.push(helperChart[key]);
      //   } else {
      //     helperChart[key].searches += parseInt(o.searches);
      //     if(o.revenue) {
      //       helperChart[key].revenue += o.revenue;
      //     }
      //   } 
      //   return r;
      // }, []);
      //duplicated remove Before Month Data
      // let filter_before_data = chartAllBeforeLyonStat.filter((obj, pos, arr) => {
      //   return arr
      //     .map(mapObj => mapObj._id)
      //     .indexOf(obj._id) == pos;
      // });
      // var helperBeforeChart = {};
      // var resultBeforeChart = chartAllBeforeLyonStat.reduce(function(r, o) {
      //   var key = o.date;
      //   if(!helperBeforeChart[key]) {
      //     helperBeforeChart[key] = Object.assign({}, o); // create a copy of o
      //     r.push(helperBeforeChart[key]);
      //   } else {
      //     helperBeforeChart[key].searches += parseInt(o.searches);
      //     if(o.revenue) {
      //       helperBeforeChart[key].revenue += o.revenue;
      //     }
      //   } 
      //   return r;
      // }, []);
      var revenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var revenuePerDayBeforeVal = [];
      var datesOfRevenueBeforeVal = [];
      var chartLyonDataValue = {};
      var revenueCurrentSum = 0;
      var revenueBeforeSum = 0;
      for (var dayData of this.allDaysList) {
        var checkExistDay = chartAllLyonStat.filter((result_1) => result_1.date == dayData);
        if (checkExistDay.length == 0) {
          revenuePerDayVal.push(0);
          datesOfRevenueVal.push(dayData);
        } else {
          for (var resVal of checkExistDay) {
            revenueCurrentSum += resVal.revenue;
            revenuePerDayVal.push(resVal.revenue);
            datesOfRevenueVal.push(resVal.date);
          }
        }
      }
      for (var resBeforeVal of chartAllBeforeLyonStat) {
        revenueBeforeSum += resBeforeVal.revenue;
        revenuePerDayBeforeVal.push(resBeforeVal.revenue);
        datesOfRevenueBeforeVal.push(resBeforeVal.date);
      }
      chartLyonDataValue['revenuePerDay'] = revenuePerDayVal;
      chartLyonDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartLyonDataValue['revenueBeforePerDay'] = revenuePerDayBeforeVal;
      chartLyonDataValue['datesOfRevenueBefore'] = datesOfRevenueBeforeVal;
      chartLyonDataValue['revenueCurrentSum'] = Number.parseFloat(revenueCurrentSum.toFixed(2));
      chartLyonDataValue['revenueBeforeSum'] = Number.parseFloat(revenueBeforeSum.toFixed(2));
      chartLyonDataValue['statType'] = "Lyons";
      chartLyonDataValue['redirectUri'] = "/reporting/lyons";
      chartLyonMetric.push(chartLyonDataValue);
      return chartLyonMetric;
    } catch (error) {
      return error;
    }
  }

  async getRubiChart(company: string) {
    try {
      const response = await this.rubiService.getAllDashboardStats().toPromise();
      this.allRubiChart = response[0];
      var chartRubiMetric = [];
      var chartAllRubiStat = this.allRubiChart.currentStat;
      var chartAllBeforeRubiStat = this.allRubiChart.beforeStat;
      chartAllRubiStat = chartAllRubiStat.slice().sort((a, b) => a.date - b.date);
      chartAllBeforeRubiStat = chartAllBeforeRubiStat.slice().sort((a_1, b_1) => a_1.date - b_1.date);
      var revenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var revenuePerDayBeforeVal = [];
      var datesOfRevenueBeforeVal = [];
      var chartRubiDataValue = {};
      var revenueCurrentSum = 0;
      var revenueBeforeSum = 0;
      for (var dayData of this.allDaysList) {
        var checkExistDay = chartAllRubiStat.filter((result_1) => result_1.date == dayData);
        if (checkExistDay.length == 0) {
          revenuePerDayVal.push(0);
          datesOfRevenueVal.push(dayData);
        } else {
          for (var resVal of checkExistDay) {
            revenueCurrentSum += resVal.revenue;
            revenuePerDayVal.push(resVal.revenue);
            datesOfRevenueVal.push(resVal.date);
          }
        }
      }
      for (var resBeforeVal of chartAllBeforeRubiStat) {
        revenueBeforeSum += resBeforeVal.revenue;
        revenuePerDayBeforeVal.push(resBeforeVal.revenue);
        datesOfRevenueBeforeVal.push(resBeforeVal.date);
      }
      chartRubiDataValue['revenuePerDay'] = revenuePerDayVal;
      chartRubiDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartRubiDataValue['revenueBeforePerDay'] = revenuePerDayBeforeVal;
      chartRubiDataValue['datesOfRevenueBefore'] = datesOfRevenueBeforeVal;
      chartRubiDataValue['revenueCurrentSum'] = Number.parseFloat(revenueCurrentSum.toFixed(2));
      chartRubiDataValue['revenueBeforeSum'] = Number.parseFloat(revenueBeforeSum.toFixed(2));
      chartRubiDataValue['statType'] = "Rubi";
      chartRubiDataValue['redirectUri'] = "/reporting/rubi";
      chartRubiMetric.push(chartRubiDataValue);
      return chartRubiMetric;
    } catch (error) {
      return error;
    }
  }

  async getHopkinChart(company: string) {
    try {
      const response = await this.hopkinService.getAllDashboardStats().toPromise();
      this.allHopkinChart = response[0];
      var chartHopkinMetric = [];
      var chartAllHopkinStat = this.allHopkinChart.currentStat;
      var chartAllBeforeHopkinStat = this.allHopkinChart.beforeStat;
      chartAllHopkinStat = chartAllHopkinStat.slice().sort((a, b) => a.date - b.date);
      chartAllBeforeHopkinStat = chartAllBeforeHopkinStat.slice().sort((a_1, b_1) => a_1.date - b_1.date);
      var revenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var revenuePerDayBeforeVal = [];
      var datesOfRevenueBeforeVal = [];
      var chartHopkinDataValue = {};
      var revenueCurrentSum = 0;
      var revenueBeforeSum = 0;
      for (var dayData of this.allDaysList) {
        var checkExistDay = chartAllHopkinStat.filter((result_1) => result_1.date == dayData);
        if (checkExistDay.length == 0) {
          revenuePerDayVal.push(0);
          datesOfRevenueVal.push(dayData);
        } else {
          for (var resVal of checkExistDay) {
            revenueCurrentSum += resVal.revenue;
            revenuePerDayVal.push(resVal.revenue);
            datesOfRevenueVal.push(resVal.date);
          }
        }
      }
      for (var resBeforeVal of chartAllBeforeHopkinStat) {
        revenueBeforeSum += resBeforeVal.revenue;
        revenuePerDayBeforeVal.push(resBeforeVal.revenue);
        datesOfRevenueBeforeVal.push(resBeforeVal.date);
      }
      chartHopkinDataValue['revenuePerDay'] = revenuePerDayVal;
      chartHopkinDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartHopkinDataValue['revenueBeforePerDay'] = revenuePerDayBeforeVal;
      chartHopkinDataValue['datesOfRevenueBefore'] = datesOfRevenueBeforeVal;
      chartHopkinDataValue['revenueCurrentSum'] = Number.parseFloat(revenueCurrentSum.toFixed(2));
      chartHopkinDataValue['revenueBeforeSum'] = Number.parseFloat(revenueBeforeSum.toFixed(2));
      chartHopkinDataValue['statType'] = "Hopkins YHS";
      chartHopkinDataValue['redirectUri'] = "/reporting/hopkin";
      chartHopkinMetric.push(chartHopkinDataValue);
      return chartHopkinMetric;
    } catch (error) {
      return error;
    }
  }

  async getSystem1Chart(company: string) {
    try {
      const response = await this.system1Service.getAllDashboardStats().toPromise();
      this.allSystem1Chart = response[0];
      var chartSystem1Metric = [];
      var chartAllSystem1Stat = this.allSystem1Chart.currentStat;
      var chartAllBeforeSystem1Stat = this.allSystem1Chart.beforeStat;
      chartAllSystem1Stat = chartAllSystem1Stat.slice().sort((a, b) => a.date - b.date);
      chartAllBeforeSystem1Stat = chartAllBeforeSystem1Stat.slice().sort((a_1, b_1) => a_1.date - b_1.date);
      var revenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var revenuePerDayBeforeVal = [];
      var datesOfRevenueBeforeVal = [];
      var chartSystem1DataValue = {};
      var revenueCurrentSum = 0;
      var revenueBeforeSum = 0;
      for (var dayData of this.allDaysList) {
        var checkExistDay = chartAllSystem1Stat.filter((result_1) => result_1.date == dayData);
        if (checkExistDay.length == 0) {
          revenuePerDayVal.push(0);
          datesOfRevenueVal.push(dayData);
        } else {
          for (var resVal of checkExistDay) {
            revenueCurrentSum += resVal.revenue;
            revenuePerDayVal.push(resVal.revenue);
            datesOfRevenueVal.push(resVal.date);
          }
        }
      }
      for (var resBeforeVal of chartAllBeforeSystem1Stat) {
        revenueBeforeSum += resBeforeVal.revenue;
        revenuePerDayBeforeVal.push(resBeforeVal.revenue);
        datesOfRevenueBeforeVal.push(resBeforeVal.date);
      }
      chartSystem1DataValue['revenuePerDay'] = revenuePerDayVal;
      chartSystem1DataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartSystem1DataValue['revenueBeforePerDay'] = revenuePerDayBeforeVal;
      chartSystem1DataValue['datesOfRevenueBefore'] = datesOfRevenueBeforeVal;
      chartSystem1DataValue['revenueCurrentSum'] = Number.parseFloat(revenueCurrentSum.toFixed(2));
      chartSystem1DataValue['revenueBeforeSum'] = Number.parseFloat(revenueBeforeSum.toFixed(2));
      chartSystem1DataValue['statType'] = "System 1";
      chartSystem1DataValue['redirectUri'] = "/reporting/system1";
      chartSystem1Metric.push(chartSystem1DataValue);
      return chartSystem1Metric;
    } catch (error) {
      return error;
    }
  }

  getProviderChart(company: string) {

  }

  //get Verizon Direct chart
  async getVerizonChart(company: string) {
    try {
      const response = await this.verizonService.getAllDashboardStats().toPromise();
      this.allVerizonChart = response[0];
      var chartVerizonMetric = [];
      var chartAllVerizonStat = this.allVerizonChart.currentStat;
      var chartAllBeforeVerizonStat = this.allVerizonChart.beforeStat;
      chartAllVerizonStat = chartAllVerizonStat.slice().sort((a, b) => a.date - b.date);
      chartAllBeforeVerizonStat = chartAllBeforeVerizonStat.slice().sort((a_1, b_1) => a_1.date - b_1.date);
      var revenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var revenuePerDayBeforeVal = [];
      var datesOfRevenueBeforeVal = [];
      var chartVerizonDataValue = {};
      var revenueCurrentSum = 0;
      var revenueBeforeSum = 0;
      for (var dayData of this.allDaysList) {
        var checkExistDay = chartAllVerizonStat.filter((result_1) => result_1.date == dayData);
        if (checkExistDay.length == 0) {
          revenuePerDayVal.push(0);
          datesOfRevenueVal.push(dayData);
        } else {
          for (var resVal of checkExistDay) {
            revenueCurrentSum += resVal.revenue;
            revenuePerDayVal.push(resVal.revenue);
            datesOfRevenueVal.push(resVal.date);
          }
        }
      }
      for (var resBeforeVal of chartAllBeforeVerizonStat) {
        revenueBeforeSum += resBeforeVal.revenue;
        revenuePerDayBeforeVal.push(resBeforeVal.revenue);
        datesOfRevenueBeforeVal.push(resBeforeVal.date);
      }
      chartVerizonDataValue['revenuePerDay'] = revenuePerDayVal;
      chartVerizonDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartVerizonDataValue['revenueBeforePerDay'] = revenuePerDayBeforeVal;
      chartVerizonDataValue['datesOfRevenueBefore'] = datesOfRevenueBeforeVal;
      chartVerizonDataValue['revenueCurrentSum'] = Number.parseFloat(revenueCurrentSum.toFixed(2));
      chartVerizonDataValue['revenueBeforeSum'] = Number.parseFloat(revenueBeforeSum.toFixed(2));
      chartVerizonDataValue['statType'] = "Verizon Direct";
      chartVerizonDataValue['redirectUri'] = "/reporting/verizon-direct";
      chartVerizonMetric.push(chartVerizonDataValue);
      return chartVerizonMetric;
    } catch (error) {
      return error;
    }
  }

  //get Tags with selected company
  async getCompanyTags(selectedCompany: string) {
    var companyId: any;
    if (selectedCompany) {
      companyId = selectedCompany.split("/")[1];
    } else {
      companyId = null;
    }
    try {
      const response = await this.tagService.getCompanyTags(companyId).toPromise();
      return response;
    } catch (error) {
      return error;
    }
  }

  //Get Solex Bc
  async getSolexBCChart(company: string) {
    try {
      const response = await this.solexbcService.getAllDashboardStats().toPromise();
      this.allSolexBCChart = response[0];
      var chartSolexBCMetric = [];
      var chartAllSolexBCStat = this.allSolexBCChart.currentStat;
      var chartAllBeforeSolexBCStat = this.allSolexBCChart.beforeStat;
      chartAllSolexBCStat = chartAllSolexBCStat.slice().sort((a, b) => a.date - b.date);
      chartAllBeforeSolexBCStat = chartAllBeforeSolexBCStat.slice().sort((a_1, b_1) => a_1.date - b_1.date);
      var revenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var revenuePerDayBeforeVal = [];
      var datesOfRevenueBeforeVal = [];
      var chartSolexBCDataValue = {};
      var revenueCurrentSum = 0;
      var revenueBeforeSum = 0;
      for (var dayData of this.allDaysList) {
        var checkExistDay = chartAllSolexBCStat.filter((result_1) => result_1.date == dayData);
        if (checkExistDay.length == 0) {
          revenuePerDayVal.push(0);
          datesOfRevenueVal.push(dayData);
        } else {
          for (var resVal of checkExistDay) {
            revenueCurrentSum += resVal.revenue;
            revenuePerDayVal.push(resVal.revenue);
            datesOfRevenueVal.push(resVal.date);
          }
        }
      }
      for (var resBeforeVal of chartAllBeforeSolexBCStat) {
        revenueBeforeSum += resBeforeVal.revenue;
        revenuePerDayBeforeVal.push(resBeforeVal.revenue);
        datesOfRevenueBeforeVal.push(resBeforeVal.date);
      }
      chartSolexBCDataValue['revenuePerDay'] = revenuePerDayVal;
      chartSolexBCDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartSolexBCDataValue['revenueBeforePerDay'] = revenuePerDayBeforeVal;
      chartSolexBCDataValue['datesOfRevenueBefore'] = datesOfRevenueBeforeVal;
      chartSolexBCDataValue['revenueCurrentSum'] = Number.parseFloat(revenueCurrentSum.toFixed(2));
      chartSolexBCDataValue['revenueBeforeSum'] = Number.parseFloat(revenueBeforeSum.toFixed(2));
      chartSolexBCDataValue['statType'] = "SolexBC";
      chartSolexBCDataValue['redirectUri'] = "/reporting/solex-bc";
      chartSolexBCMetric.push(chartSolexBCDataValue);
      return chartSolexBCMetric;
    } catch (error) {
      return error;
    }
  }

  //Get Apptitude
  async getApptitudeChart(company: string) {
    try {
      const response = await this.apptitudeService.getAllDashboardStats().toPromise();
      this.allApptitudeChart = response[0];
      var chartRubiMetric = [];
      var chartAllApptitudeStat = this.allApptitudeChart.currentStat;
      var chartAllBeforeApptitudeStat = this.allApptitudeChart.beforeStat;
      chartAllApptitudeStat = chartAllApptitudeStat.slice().sort((a, b) => a.date - b.date);
      chartAllBeforeApptitudeStat = chartAllBeforeApptitudeStat.slice().sort((a_1, b_1) => a_1.date - b_1.date);
      var revenuePerDayVal = [];
      var datesOfRevenueVal = [];
      var revenuePerDayBeforeVal = [];
      var datesOfRevenueBeforeVal = [];
      var chartApptitudeDataValue = {};
      var revenueCurrentSum = 0;
      var revenueBeforeSum = 0;
      for (var dayData of this.allDaysList) {
        var checkExistDay = chartAllApptitudeStat.filter((result_1) => result_1.date == dayData);
        if (checkExistDay.length == 0) {
          revenuePerDayVal.push(0);
          datesOfRevenueVal.push(dayData);
        } else {
          for (var resVal of checkExistDay) {
            revenueCurrentSum += resVal.revenue;
            revenuePerDayVal.push(resVal.revenue);
            datesOfRevenueVal.push(resVal.date);
          }
        }
      }
      for (var resBeforeVal of chartAllBeforeApptitudeStat) {
        revenueBeforeSum += resBeforeVal.revenue;
        revenuePerDayBeforeVal.push(resBeforeVal.revenue);
        datesOfRevenueBeforeVal.push(resBeforeVal.date);
      }
      chartApptitudeDataValue['revenuePerDay'] = revenuePerDayVal;
      chartApptitudeDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartApptitudeDataValue['revenueBeforePerDay'] = revenuePerDayBeforeVal;
      chartApptitudeDataValue['datesOfRevenueBefore'] = datesOfRevenueBeforeVal;
      chartApptitudeDataValue['revenueCurrentSum'] = Number.parseFloat(revenueCurrentSum.toFixed(2));
      chartApptitudeDataValue['revenueBeforeSum'] = Number.parseFloat(revenueBeforeSum.toFixed(2));
      chartApptitudeDataValue['statType'] = "Monarch Apptitude";
      chartApptitudeDataValue['redirectUri'] = "/reporting/apptitude";
      chartRubiMetric.push(chartApptitudeDataValue);
      return chartRubiMetric;
    } catch (error) {
      return error;
    }
  }

  getCurrentMontDateList() {
    const lastThirtyDays = [...new Array(30)].map((i, idx) => moment().utc().startOf("day").subtract(idx, "days").toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime()).reverse();
    return lastThirtyDays;
  }
}
