import { Component, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UsersService } from '../../../shared/service/users.service';
import { AccountingService } from 'src/app/shared/service/admin-stats/accounting.service';
import { TagManagementService } from 'src/app/modules/tag-management/tag-management.service';
import { CompanyManagementService } from 'src/app/modules/company-management/company-management.service';
import * as _ from "lodash";

@Component({
  selector: 'app-accounting',
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.scss']
})
export class AccountingComponent implements AfterViewInit {

  selectedCompany: any;
  @ViewChild('expandableTable') table: any;
  rows: any = [];
  loadingIndicator = true;
  range = {
    startDate: '',
    endDate: '',
  };
  allRubiStats: any = [];
  allLyonStats: any = [];
  allPerionStats: any = [];
  allSystem1Stats: any = [];
  allVerizonStats: any = [];
  allSolexBCStats: any = [];
  allApptitudeStats: any = [];
  tagList: any = [];
  LyonData: any;
  PerionData: any;
  RubiData: any;
  System1Data: any;
  VerizonData: any;
  SolexBCData: any;
  ApptitudeData: any;
  tempStatData: any = [];
  tempUpdateStatData: any = [];
  reportTypeData: any = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UsersService,
    private accountingService: AccountingService,
    private tagService: TagManagementService,
    private companyService: CompanyManagementService,
  ) {
    this.selectedCompany = this.getSelectedCompanyStored();
  }

  async ngAfterViewInit() {
    this.tagList = await this.getCompanyTags(this.selectedCompany);
    this.reportTypeData = await this.getReportingProviderList();
    this.rows = [];
    this.tempStatData = [];
    
    if (this.reportTypeData.includes('perion')) {
      this.PerionData = await this.getPerionStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempStatData = this.tempStatData.concat(this.PerionData);
    }
    if (this.reportTypeData.includes('lyons')) {
      this.LyonData = await this.getLyonStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempStatData = this.tempStatData.concat(this.LyonData);
    }
    if (this.reportTypeData.includes('rubi')) {
      this.RubiData = await this.getRubiStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempStatData = this.tempStatData.concat(this.RubiData);
    }
    if (this.reportTypeData.includes('apptitude')) {
      this.ApptitudeData = await this.getApptitudeStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempStatData = this.tempStatData.concat(this.ApptitudeData);
    }

    if (this.reportTypeData.includes('solex-bc')) {
      this.SolexBCData = await this.getSolexBCStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempStatData = this.tempStatData.concat(this.SolexBCData);
    }
    if (this.reportTypeData.includes('verizon-direct')) {
      this.VerizonData = await this.getVerizonDirectStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempStatData = this.tempStatData.concat(this.VerizonData);
    }
    if (this.reportTypeData.includes('system1')) {
      this.System1Data = await this.getSystem1Stats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempStatData = this.tempStatData.concat(this.System1Data);
    }
    const result = [];

    this.tempStatData.forEach((object: { publisher: any; reporting: any[]; revenue: any; everyrevenue: string[]; total: any; }) => {
      const existing = result.filter((item) => item.publisher == object.publisher);
      if (existing.length) {
        const existingIndex = result.indexOf(existing[0]);
        result[existingIndex].reporting = result[existingIndex].reporting.concat(object.reporting);
        result[existingIndex].everyrevenue = result[existingIndex].everyrevenue.concat(String(object.revenue));
        result[existingIndex].total = result[existingIndex].total + object.revenue;
      } else {
        if (typeof object.reporting == 'string') object.reporting = [object.reporting];
        if (typeof object.revenue == 'number') {
          object.everyrevenue = [String(object.revenue)];
          object.total = object.revenue;
        }
        result.push(object);
      }
    });

    for (var resultData of result) {

      resultData.detailHeight = (resultData.reporting.length + 1) * 30;
    }
    this.rows = result;

    this.loadingIndicator = false;
    this.cdr.detectChanges();
  }

  //Gets the Selected Company from Local Storage
  getSelectedCompanyStored() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  public async updateReportingFiltering(range: any) {
    this.loadingIndicator = true;
    this.range = range;
    this.rows = [];
    this.tempUpdateStatData = [];
    var perionUpData = [];
    var lyonsUpData = [];
    var rubiUpData = [];
    var apptitudeUpData = [];
    var solexBCUpData = [];
    var verizonUpData = [];
    var system1UpData = [];
    
    if (this.reportTypeData.includes('perion')) {
      perionUpData = await this.getPerionStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempUpdateStatData = this.tempUpdateStatData.concat(perionUpData);
    }
    if (this.reportTypeData.includes('lyons')) {
      lyonsUpData = await this.getLyonStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempUpdateStatData = this.tempUpdateStatData.concat(lyonsUpData);
    }
    if (this.reportTypeData.includes('rubi')) {
      rubiUpData = await this.getRubiStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempUpdateStatData = this.tempUpdateStatData.concat(rubiUpData);
    }
    if (this.reportTypeData.includes('apptitude')) {
      apptitudeUpData = await this.getApptitudeStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempUpdateStatData = this.tempUpdateStatData.concat(apptitudeUpData);
    }

    if (this.reportTypeData.includes('solex-bc')) {
      solexBCUpData = await this.getSolexBCStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempUpdateStatData = this.tempUpdateStatData.concat(solexBCUpData);
    }
    if (this.reportTypeData.includes('verizon-direct')) {
      verizonUpData = await this.getVerizonDirectStats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempUpdateStatData = this.tempUpdateStatData.concat(verizonUpData);
    }
    if (this.reportTypeData.includes('system1')) {
      system1UpData = await this.getSystem1Stats(
        this.selectedCompany,
        this.range.startDate,
        this.range.endDate
      );
      this.tempUpdateStatData = this.tempUpdateStatData.concat(system1UpData);
    }
    const result = [];
    
    // var sorted = _.chain(this.tempUpdateStatData)
    //   .sortBy(function (d) { return d.reporting })
    //   .sortBy(function (d) { return d.publisher })
    //   .value()
    // const multiGroupBy = (seq: any, keys: string | any[]) => {
    //   if (!keys.length) return seq;
    //   var first = keys[0];
    //   var rest = keys.slice(1);
    //   return _.mapValues(_.groupBy(seq, first), function (value: any) {
    //     return multiGroupBy(value, rest);
    //   });
    // };
    // const groupedItems = multiGroupBy(sorted, ["reporting", "publisher"]);
    
    // const reformattedArray = [];

    // for (const item in groupedItems) {
    //   if (groupedItems.hasOwnProperty(item)) {
    //     for (const elm in groupedItems[item]) {
    //       const obj = {
    //         reporting: groupedItems[item][elm][0].reporting,
    //         publisher: groupedItems[item][elm][0].publisher,
    //         revenue: _.reduce(groupedItems[item][elm], (s: any, x: { revenue: any; }) => s + x.revenue, 0),
    //       };
    //       reformattedArray.push(obj);
    //     }
    //   }
    // }
    // console.log(reformattedArray, 'dddd')
    this.tempUpdateStatData.forEach((object: { publisher: any; reporting: any[]; revenue: any; everyrevenue: string[]; total: any; }) => {
      const existing = result.filter((item) => item.publisher == object.publisher);
      if (existing.length) {
        const existingIndex = result.indexOf(existing[0]);
        result[existingIndex].reporting = result[existingIndex].reporting.concat(object.reporting);
        result[existingIndex].everyrevenue = result[existingIndex].everyrevenue.concat(String(object.revenue));
        result[existingIndex].total = result[existingIndex].total + object.revenue;
      } else {
        if (typeof object.reporting == 'string') object.reporting = [object.reporting];
        if (typeof object.revenue == 'number') {
          object.everyrevenue = [String(object.revenue)];
          object.total = object.revenue;
        }
        result.push(object);
      }
    });
    for (var resultData of result) {
      resultData.detailHeight = (resultData.reporting.length + 1) * 30;
    }
    this.rows = result;
    this.loadingIndicator = false;
    this.cdr.detectChanges();
  }

  //get Report Providers in Current Company
  async getReportingProviderList() {
    if (this.selectedCompany) {
      try {
        const res = await this.companyService.getReportCompany(this.selectedCompany.split('/')[1]).toPromise();
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

  async getRubiStats(company: any, startDate: string, endDate: string) {
    const response = await this.accountingService.getRubiStats(company, startDate, endDate).toPromise();
    this.allRubiStats = response.stats;
    for (var tagL of this.tagList) {
      if (tagL.tag.advertiser == "rubi") {
        for (var tagSub of tagL.tag.subids) {
          if (tagSub.filterTag == "Contains") {
            this.allRubiStats.map(stat => {
              if (stat.subid.includes(tagSub.subid)) {
                stat.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat.reporting = "Rubi";
              }
            });

          } else if (tagSub.filterTag == "StartsWith") {
            this.allRubiStats.map(stat_1 => {
              if (stat_1.subid.startsWith(tagSub.subid)) {
                stat_1.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_1.reporting = "Rubi";
              }
            });

          } else if (tagSub.filterTag == "EndsWith") {
            this.allRubiStats.map(stat_2 => {
              if (stat_2.subid.endsWith(tagSub.subid)) {
                stat_2.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_2.reporting = "Rubi";
              }
            });

          } else if (tagSub.filterTag == "ExactValue") {
            this.allRubiStats.map(stat_3 => {
              if (stat_3.subid == tagSub.subid) {
                stat_3.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_3.reporting = "Rubi";
              }
            });

          }
        }
      }
    }
    var rubiStats = [];
    var helperRubiSummary = {};
    if (this.allRubiStats.length > 0) {
      var groupRubiData = this.allRubiStats.reduce(function (r, o) {
        var key = o.publisher;
        if (!helperRubiSummary[key]) {
          helperRubiSummary[key] = Object.assign({}, o); // create a copy of o
          r.push(helperRubiSummary[key]);
        } else {
          helperRubiSummary[key].revenue += parseFloat(o.revenue);
        }
        return r;
      }, []);
      groupRubiData.map((rubiOne: any) => {
        rubiStats.push({
          publisher: rubiOne.publisher ? rubiOne.publisher : "No Publisher",
          reporting: rubiOne.reporting ? rubiOne.reporting : "No Reporting",
          revenue: rubiOne.revenue
        });
      });
    }

    return rubiStats;
  }

  async getSolexBCStats(company: any, startDate: string, endDate: string) {
    const response = await this.accountingService.getSolexBCStats(company, startDate, endDate).toPromise();
    this.allSolexBCStats = response.stats;
    for (var tagL of this.tagList) {
      if (tagL.tag.advertiser == "solex-bc") {
        for (var tagSub of tagL.tag.subids) {
          if (tagSub.filterTag == "Contains") {
            this.allSolexBCStats.map(stat => {
              if (stat.subid.includes(tagSub.subid)) {
                stat.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat.reporting = "Solex BC";
              }
            });

          } else if (tagSub.filterTag == "StartsWith") {
            this.allSolexBCStats.map(stat_1 => {
              if (stat_1.subid.startsWith(tagSub.subid)) {
                stat_1.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_1.reporting = "Solex BC";
              }
            });

          } else if (tagSub.filterTag == "EndsWith") {
            this.allSolexBCStats.map(stat_2 => {
              if (stat_2.subid.endsWith(tagSub.subid)) {
                stat_2.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_2.reporting = "Solex BC";
              }
            });

          } else if (tagSub.filterTag == "ExactValue") {
            this.allSolexBCStats.map(stat_3 => {
              if (stat_3.subid == tagSub.subid) {
                stat_3.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_3.reporting = "Solex BC";
              }
            });

          }
        }
      }
    }
    var solexBCStats = [];
    var helperSolexBCSummary = {}
    if (this.allSolexBCStats.length > 0) {
      var groupSolexBCData = this.allSolexBCStats.reduce(function (r, o) {
        var key = o.publisher;
        if (!helperSolexBCSummary[key]) {
          helperSolexBCSummary[key] = Object.assign({}, o); // create a copy of o
          r.push(helperSolexBCSummary[key]);
        } else {
          helperSolexBCSummary[key].revenue += parseFloat(o.revenue);
        }
        return r;
      }, []);
      groupSolexBCData.map((solexbcOne: any) => {
        solexBCStats.push({
          publisher: solexbcOne.publisher ? solexbcOne.publisher : "No Publisher",
          reporting: solexbcOne.reporting ? solexbcOne.reporting : "No Reporting",
          revenue: solexbcOne.revenue
        });
      });

    }

    return solexBCStats;
  }

  async getVerizonDirectStats(company: any, startDate: string, endDate: string) {
    const response = await this.accountingService.getVerizonDirectStats(company, startDate, endDate).toPromise();
    this.allVerizonStats = response.stats;
    for (var tagL of this.tagList) {
      if (tagL.tag.advertiser == "verizon-direct") {
        for (var tagSub of tagL.tag.subids) {
          if (tagSub.filterTag == "Contains") {
            this.allVerizonStats.map(stat => {
              if (stat.subid.includes(tagSub.subid)) {
                stat.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat.reporting = "Verizon Direct";
              }
            });

          } else if (tagSub.filterTag == "StartsWith") {
            this.allVerizonStats.map(stat_1 => {
              if (stat_1.subid.startsWith(tagSub.subid)) {
                stat_1.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_1.reporting = "Verizon Direct";
              }
            });

          } else if (tagSub.filterTag == "EndsWith") {
            this.allVerizonStats.map(stat_2 => {
              if (stat_2.subid.endsWith(tagSub.subid)) {
                stat_2.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_2.reporting = "Verizon Direct";
              }
            });

          } else if (tagSub.filterTag == "ExactValue") {
            this.allVerizonStats.map(stat_3 => {
              if (stat_3.subid == tagSub.subid) {
                stat_3.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_3.reporting = "Verizon Direct";
              }
            });

          }
        }
      }
    }
    var verizonStats = [];
    var helperVerizonSummary = {};
    if (this.allVerizonStats.length > 0) {
      var groupVerizonData = this.allVerizonStats.reduce(function (r, o) {
        var key = o.publisher;
        if (!helperVerizonSummary[key]) {
          helperVerizonSummary[key] = Object.assign({}, o); // create a copy of o
          r.push(helperVerizonSummary[key]);
        } else {
          helperVerizonSummary[key].revenue += parseFloat(o.revenue);
        }
        return r;
      }, []);
      groupVerizonData.map((verizonOne: any) => {
        verizonStats.push({
          publisher: verizonOne.publisher ? verizonOne.publisher : "No Publisher",
          reporting: verizonOne.reporting ? verizonOne.reporting : "No Reporting",
          revenue: verizonOne.revenue
        });
      });

    }

    return verizonStats;
  }

  async getLyonStats(company: any, startDate: string, endDate: string) {
    const response = await this.accountingService.getLyonStats(company, startDate, endDate).toPromise();
    this.allLyonStats = response.stats;
    for (var tagL of this.tagList) {
      if (tagL.tag.advertiser == "lyons") {
        for (var tagSub of tagL.tag.subids) {
          if (tagSub.filterTag == "Contains") {
            this.allLyonStats.map(stat => {
              if (stat.subid.includes(tagSub.subid)) {
                stat.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat.reporting = "Lyons";
              }
            });

          } else if (tagSub.filterTag == "StartsWith") {
            this.allLyonStats.map(stat_1 => {
              if (stat_1.subid.startsWith(tagSub.subid)) {
                stat_1.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_1.reporting = "Lyons";
              }
            });

          } else if (tagSub.filterTag == "EndsWith") {
            this.allLyonStats.map(stat_2 => {
              if (stat_2.subid.endsWith(tagSub.subid)) {
                stat_2.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_2.reporting = "Lyons";
              }
            });

          } else if (tagSub.filterTag == "ExactValue") {
            this.allLyonStats.map(stat_3 => {
              if (stat_3.subid == tagSub.subid) {
                stat_3.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_3.reporting = "Lyons";
              }
            });

          }
        }
      }
    }
    var lyonStats = [];
    var helperLyonsSummary = {}
    if (this.allLyonStats.length > 0) {
      var groupLyonsData = this.allLyonStats.reduce(function (r, o) {
        var key = o.publisher;
        if (!helperLyonsSummary[key]) {
          helperLyonsSummary[key] = Object.assign({}, o); // create a copy of o
          r.push(helperLyonsSummary[key]);
        } else {
          helperLyonsSummary[key].revenue += parseFloat(o.revenue);
        }
        return r;
      }, []);
      groupLyonsData.map((lyonOne: any) => {
        lyonStats.push({
          publisher: lyonOne.publisher ? lyonOne.publisher : "No Publisher",
          reporting: lyonOne.reporting ? lyonOne.reporting : "No Reporting",
          revenue: lyonOne.revenue
        });
      });

    }

    return lyonStats;
  }

  async getPerionStats(company: any, startDate: string, endDate: string) {
    const response = await this.accountingService.getPerionStats(company, startDate, endDate).toPromise();
    this.allPerionStats = response.stats;
    for (var tagL of this.tagList) {
      if (tagL.tag.advertiser == "perion") {
        for (var tagSub of tagL.tag.subids) {
          if (tagSub.filterTag == "Contains") {
            this.allPerionStats.map(stat => {
              if (stat.subid.includes(tagSub.subid)) {
                stat.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat.reporting = "Perion";
              }
            });

          } else if (tagSub.filterTag == "StartsWith") {
            this.allPerionStats.map(stat_1 => {
              if (stat_1.subid.startsWith(tagSub.subid)) {
                stat_1.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_1.reporting = "Perion";
              }
            });

          } else if (tagSub.filterTag == "EndsWith") {
            this.allPerionStats.map(stat_2 => {
              if (stat_2.subid.endsWith(tagSub.subid)) {
                stat_2.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_2.reporting = "Perion";
              }
            });

          } else if (tagSub.filterTag == "ExactValue") {
            this.allPerionStats.map(stat_3 => {
              if (stat_3.subid == tagSub.subid) {
                stat_3.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_3.reporting = "Perion";
              }
            });

          }
        }
      }
    }
    var perionStats = [];
    var helperPerionSummary = {};

    if (this.allPerionStats.length > 0) {
      var groupPerionData = this.allPerionStats.reduce(function (r, o) {
        var key = o.publisher;
        if (!helperPerionSummary[key]) {
          helperPerionSummary[key] = Object.assign({}, o); // create a copy of o
          r.push(helperPerionSummary[key]);
        } else {
          helperPerionSummary[key].revenue += parseFloat(o.revenue);
        }
        return r;
      }, []);
      groupPerionData.map((perionOne: any) => {
        perionStats.push({
          publisher: perionOne.publisher ? perionOne.publisher : "No Publisher",
          reporting: perionOne.reporting ? perionOne.reporting : "No Reporting",
          revenue: perionOne.revenue
        });
      });

    }
    return perionStats;
  }

  async getApptitudeStats(company: any, startDate: string, endDate: string) {
    const response = await this.accountingService.getApptitudeStats(company, startDate, endDate).toPromise();
    this.allApptitudeStats = response.stats;
    for (var tagL of this.tagList) {
      if (tagL.tag.advertiser == "apptitude") {
        for (var tagSub of tagL.tag.subids) {
          if (tagSub.filterTag == "Contains") {
            this.allApptitudeStats.map(stat => {
              if (stat.subid.includes(tagSub.subid)) {
                stat.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat.reporting = "Apptitude";
              }
            });

          } else if (tagSub.filterTag == "StartsWith") {
            this.allApptitudeStats.map(stat_1 => {
              if (stat_1.subid.startsWith(tagSub.subid)) {
                stat_1.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_1.reporting = "Apptitude";
              }
            });

          } else if (tagSub.filterTag == "EndsWith") {
            this.allApptitudeStats.map(stat_2 => {
              if (stat_2.subid.endsWith(tagSub.subid)) {
                stat_2.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_2.reporting = "Apptitude";
              }
            });

          } else if (tagSub.filterTag == "ExactValue") {
            this.allApptitudeStats.map(stat_3 => {
              if (stat_3.subid == tagSub.subid) {
                stat_3.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_3.reporting = "Apptitude";
              }
            });

          }
        }
      }
    }
    var apptitudeStats = [];
    var helperApptitudeSummary = {};
    if (this.allApptitudeStats.length > 0) {
      var groupApptitudeData = this.allApptitudeStats.reduce(function (r, o) {
        var key = o.publisher;
        if (!helperApptitudeSummary[key]) {
          helperApptitudeSummary[key] = Object.assign({}, o); // create a copy of o
          r.push(helperApptitudeSummary[key]);
        } else {
          helperApptitudeSummary[key].revenue += parseFloat(o.revenue);
        }
        return r;
      }, []);
      groupApptitudeData.map((apptitudeOne: any) => {
        apptitudeStats.push({
          publisher: apptitudeOne.publisher ? apptitudeOne.publisher : "No Publisher",
          reporting: apptitudeOne.reporting ? apptitudeOne.reporting : "No Reporting",
          revenue: apptitudeOne.revenue
        });
      });

    }
    // console.log(this.allApptitudeStats, "dfsdfsdf")

    return apptitudeStats;
  }

  async getSystem1Stats(company: any, startDate: string, endDate: string) {
    const response = await this.accountingService.getSystem1Stats(company, startDate, endDate).toPromise();
    this.allSystem1Stats = response.stats;
    for (var tagL of this.tagList) {
      if (tagL.tag.advertiser == "system1") {
        for (var tagSub of tagL.tag.subids) {
          if (tagSub.filterTag == "Contains") {
            this.allSystem1Stats.map(stat => {
              if (stat.subid.includes(tagSub.subid)) {
                stat.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat.reporting = "System1";
              }
            });

          } else if (tagSub.filterTag == "StartsWith") {
            this.allSystem1Stats.map(stat_1 => {
              if (stat_1.subid.startsWith(tagSub.subid)) {
                stat_1.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_1.reporting = "System1";
              }
            });

          } else if (tagSub.filterTag == "EndsWith") {
            this.allSystem1Stats.map(stat_2 => {
              if (stat_2.subid.endsWith(tagSub.subid)) {
                stat_2.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_2.reporting = "System1";
              }
            });

          } else if (tagSub.filterTag == "ExactValue") {
            this.allSystem1Stats.map(stat_3 => {
              if (stat_3.subid == tagSub.subid) {
                stat_3.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_3.reporting = "System1";
              }
            });

          }
        }
      }
    }
    var system1Stats = [];
    var helperSystem1Summary = {};
    if (this.allSystem1Stats.length > 0) {
      var groupSystem1Data = this.allSystem1Stats.reduce(function (r, o) {
        var key = o.publisher;
        if (!helperSystem1Summary[key]) {
          helperSystem1Summary[key] = Object.assign({}, o); // create a copy of o
          r.push(helperSystem1Summary[key]);
        } else {
          helperSystem1Summary[key].revenue += parseFloat(o.revenue);
        }
        return r;
      }, []);
      groupSystem1Data.map((system1One: any) => {
        system1Stats.push({
          publisher: system1One.publisher ? system1One.publisher : "No Publisher",
          reporting: system1One.reporting ? system1One.reporting : "No Reporting",
          revenue: system1One.revenue
        });
      });

    }

    return system1Stats;
  }

  //get Tags with selected company
  async getCompanyTags(selectedCompany: string) {
    var companyId = selectedCompany.split("/")[1];
    try {
      const response = await this.tagService.getCompanyTags(companyId).toPromise();
      return response;
    } catch (error) {
      return error;
    }
  }

  toggleExpandRow(row: any) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event: any) {
    console.log('Detail Toggled', event);
  }

  getDetailRowHeight(row: any, index: number): number {
    let height;
    if (row) {
      height = row.detailHeight;
    }
    return height;
  }

}
