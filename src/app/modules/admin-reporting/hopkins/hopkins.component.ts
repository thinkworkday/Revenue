import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataInterface } from 'src/app/shared/models/chartData.interface';
import { HopkinService } from 'src/app/shared/service/admin-stats/hopkin.service';
import { UsersService } from 'src/app/shared/service/users.service';
import { TagManagementService } from '../../tag-management/tag-management.service';
import * as _ from "lodash";

@Component({
  selector: 'app-hopkins',
  templateUrl: './hopkins.component.html',
  styleUrls: ['./hopkins.component.scss'],
})
export class HopkinsComponent implements AfterViewInit {
  range = {
    startDate: '',
    endDate: '',
  };
  loadingIndicator = true;
  rows: any[];
  selectedCompany: any;
  @ViewChild('expandableTable') table: any;
  chartData: ChartDataInterface;
  groupPublishFlag = false;
  expanded: any = {};
  allStats: any[];
  allChartStat: any[];
  summaryMetrics: any;
  tagList: any = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UsersService,
    private hopkinService: HopkinService,
    private tagService: TagManagementService,
  ) {
    this.selectedCompany = this.getSelectedCompanyStored();
  }

  async ngAfterViewInit() {
    this.tagList = await this.getCompanyTags(this.selectedCompany);
    this.rows = [];
    this.rows = await this.getAllHopkinStats(
      this.selectedCompany,
      this.range.startDate,
      this.range.endDate
    );
    this.chartData = await this.getChartMetrics(
      this.selectedCompany,
      this.range.startDate,
      this.range.endDate
    );

    this.summaryMetrics = await this.getSummaryMetrics(this.selectedCompany, this.range.startDate, this.range.endDate);
    this.refreshTable();
  }
  async getAllHopkinStats(company: any, startDate: string, endDate: string) {
    const response = await this.hopkinService.getHopkinStats(company, startDate, endDate).toPromise();
    console.log('response:', response);
    this.loadingIndicator = false;
    this.allStats = response.stats;
    this.allStats.map(function (resStat) {
      resStat.publisher = "No Publisher";
      resStat.tagname = "No Tag";
    });
    for (var tagL of this.tagList) {
      if (tagL.tag.advertiser == "hopkins") {
        for (var tagSub of tagL.tag.subids) {
          if (tagSub.filterTag == "Contains") {

            this.allStats.map(stat => {
              if (stat.subid.includes(tagSub.subid)) {
                stat.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat.tagname = tagL.tag.name;
              }
            });

          } else if (tagSub.filterTag == "StartsWith") {
            this.allStats.map(stat_1 => {
              if (stat_1.subid.startsWith(tagSub.subid)) {
                stat_1.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_1.tagname = tagL.tag.name;
              }
            });

          } else if (tagSub.filterTag == "EndsWith") {
            this.allStats.map(stat_2 => {
              if (stat_2.subid.endsWith(tagSub.subid)) {
                stat_2.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_2.tagname = tagL.tag.name;
              }
            });

          } else if (tagSub.filterTag == "ExactValue") {
            this.allStats.map(stat_3 => {
              if (stat_3.subid == tagSub.subid) {
                stat_3.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                stat_3.tagname = tagL.tag.name;
              }
            });

          }
        }
      }
    }
    return this.allStats;
  }
  groupProvider() {
    var helperSummary = {};
    var groupData = this.allStats.reduce(function (r, o) {
      var key = o.publisher;

      if (!helperSummary[key]) {
        helperSummary[key] = Object.assign({}, o); // create a copy of o
        helperSummary[key].counter = 1;
        r.push(helperSummary[key]);
      } else {
        helperSummary[key].clicks += parseFloat(o.clicks);
        helperSummary[key].searches += parseFloat(o.searches ? o.searches : 0);
        helperSummary[key].coverage += parseFloat(o.coverage ? o.coverage : 0);
        helperSummary[key].ppc += parseFloat(o.ppc ? o.ppc : 0);
        helperSummary[key].tq += parseFloat(o.tq ? o.tq : 0);
        helperSummary[key].revenue += parseFloat(o.revenue);
        helperSummary[key].split += parseFloat(o.split);
        helperSummary[key].profit += parseFloat(o.profit);
        helperSummary[key].publisherNet += parseFloat(o.publisherNet);
        helperSummary[key].counter++;
      }
      return r;
    }, []);
    for (var group of groupData) {
      group.split = group.split / group.counter;

    }
    this.rows = groupData;
    this.groupPublishFlag = true;
    this.cdr.markForCheck();
  }
  backProvider() {
    this.rows = this.allStats;
    this.groupPublishFlag = false;
    this.cdr.markForCheck();
  }

  remove_element(array, item) {
    for (var i = 0; i < array.length; ++i) {
      if (array[i] === item) {
        array.splice(i, 1);
        return;
      }
    }
  }
  public async updateReportingFiltering(range: { startDate: string; endDate: string; }) {
    this.range = range;
    this.rows = await this.getAllHopkinStats(
      this.selectedCompany,
      this.range.startDate,
      this.range.endDate
    );
    this.chartData = await this.getChartMetrics(
      this.selectedCompany,
      this.range.startDate,
      this.range.endDate
    );
    this.summaryMetrics = await this.getSummaryMetrics(this.selectedCompany, this.range.startDate, this.range.endDate);
    this.groupPublishFlag = false;
    this.refreshTable();
  }

  //Gets the Selected Company from Local Storage
  getSelectedCompanyStored() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  toggleExpandRow(row: any) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event: any) {
    console.log('Detail Toggled', event);
  }

  refreshTable() {
    this.cdr.markForCheck();
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

  async getChartMetrics(company: any, startDate: string, endDate: string) {
    try {
      const response = await this.hopkinService.getHopkinStats(company, startDate, endDate).toPromise();
      this.allChartStat = response.stats;
      this.allChartStat.map(function (resStat) {
        resStat.publisher = "No Publisher";
        resStat.tagname = "No Tag";
      });
      for (var tagL of this.tagList) {
        if (tagL.tag.advertiser == "hopkins") {
          for (var tagSub of tagL.tag.subids) {
            if (tagSub.filterTag == "Contains") {

              this.allChartStat.map(stat => {
                if (stat.subid.includes(tagSub.subid)) {
                  stat.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                  stat.tagname = tagL.tag.name;
                }
              });

            } else if (tagSub.filterTag == "StartsWith") {
              this.allChartStat.map(stat_1 => {
                if (stat_1.subid.startsWith(tagSub.subid)) {
                  stat_1.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                  stat_1.tagname = tagL.tag.name;
                }
              });

            } else if (tagSub.filterTag == "EndsWith") {
              this.allChartStat.map(stat_2 => {
                if (stat_2.subid.endsWith(tagSub.subid)) {
                  stat_2.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                  stat_2.tagname = tagL.tag.name;
                }
              });

            } else if (tagSub.filterTag == "ExactValue") {
              this.allChartStat.map(stat_3 => {
                if (stat_3.subid == tagSub.subid) {
                  stat_3.publisher = tagL.user.length ? tagL.user[0].fullname : "No Publisher";
                  stat_3.tagname = tagL.tag.name;
                }
              });

            }
          }
        }
      }

      var sorted = _.chain(this.allChartStat)
        .sortBy(function (d) { return d.date })
        .sortBy(function (d) { return d.publisher })
        .value()
      const multiGroupBy = (seq: any, keys: string | any[]) => {
        if (!keys.length) return seq;
        var first = keys[0];
        var rest = keys.slice(1);
        return _.mapValues(_.groupBy(seq, first), function (value: any) {
          return multiGroupBy(value, rest);
        });
      };

      const groupedItems = multiGroupBy(sorted, ["date", "publisher"]);

      const reformattedArray = [];

      for (const item in groupedItems) {
        if (groupedItems.hasOwnProperty(item)) {
          for (const elm in groupedItems[item]) {

            const obj = {
              date: groupedItems[item][elm][0].date,
              publisher: groupedItems[item][elm][0].publisher,
              revenue: _.reduce(groupedItems[item][elm], (s: any, x: { revenue: any; }) => s + x.revenue, 0),
            };
            reformattedArray.push(obj);
          }
        }
      }

      let pulisherArr = [];
      for (let reformatData of reformattedArray) {
        pulisherArr.push(reformatData.publisher)
      }

      var unique = pulisherArr.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      });
      // this.remove_element(unique, "No Publisher");
      // console.log(unique);

      this.allChartStat = this.allChartStat.slice().sort((a, b) => a.date - b.date);
      var helperChart = {};
      var resultChart = this.allChartStat.reduce(function (r, o) {
        var key = o.date;
        if (!helperChart[key]) {
          helperChart[key] = Object.assign({}, o); // create a copy of o
          r.push(helperChart[key]);
        } else {
          helperChart[key].searches += parseInt(o.searches);
          // if (o.revenue) {
          //   helperChart[key].revenue += o.revenue;
          // }
        }
        return r;
      }, []);
      var datesOfRevenueVal = [];
      var searchesPerDayVal = [];
      var chartDataValue = {};
      for (var resVal of resultChart) {
        datesOfRevenueVal.push(resVal.date);
        searchesPerDayVal.push(resVal.searches);
      }
      let stackedArr = [];
      for (let u of unique) {
        let subStackedArr = [];
        for (let date of datesOfRevenueVal) {
          let filterLen = reformattedArray.filter((reformatted) => reformatted.date == date && reformatted.publisher == u)
          if (filterLen.length > 0) {
            subStackedArr.push(filterLen[0].revenue)
          } else {
            subStackedArr.push(0)
          }
        }
        let obj = {};
        obj[u] = subStackedArr;
        stackedArr.push(obj);
      }
      chartDataValue['revenuePerDay'] = stackedArr;
      chartDataValue['datesOfRevenue'] = datesOfRevenueVal;
      chartDataValue['searchesPerDay'] = searchesPerDayVal;
      chartDataValue['publisherName'] = unique;
      return chartDataValue;
    } catch (error) {
      return error;
    }
  }
  async getSummaryMetrics(company: any, startDate: string, endDate: string) {
    const response = await this.hopkinService.getSummaryMetrics(company, startDate, endDate).toPromise();
    var allSummary = {};
    var currentPercentPace = 0;
    var lastPercentPace = 0;
    var selectedPercentPace = 0;
    if (response.summary[0].lastMonthStat[0].profitPace != 0) {
      currentPercentPace = (response.summary[0].summaryMetrics[0].profitPace - response.summary[0].lastMonthStat[0].profitPace) / (response.summary[0].lastMonthStat[0].profitPace) * 100;
    }
    if (response.summary[0].twoLastMonthStat[0].profitPace != 0) {
      lastPercentPace = (response.summary[0].lastMonthStat[0].profitPace - response.summary[0].twoLastMonthStat[0].profitPace) / (response.summary[0].twoLastMonthStat[0].profitPace) * 100;
    }
    if (response.summary[0].prevSelectedStat[0].profitPace != 0) {
      selectedPercentPace = (response.summary[0].selectedStat[0].profitPace - response.summary[0].prevSelectedStat[0].profitPace) / (response.summary[0].prevSelectedStat[0].profitPace) * 100;
    }
    response.summary[0].summaryMetrics[0].percentPace = currentPercentPace;
    response.summary[0].lastMonthStat[0].percentPace = lastPercentPace;
    response.summary[0].selectedStat[0].percentPace = selectedPercentPace;
    response.summary[0].selectedStat[0].selectedStartDate = startDate;
    response.summary[0].selectedStat[0].selectedEndDate = endDate;
    allSummary['summary'] = response.summary;
    return allSummary;
  }
}
