const moment = require('moment');
const { db, Companies } = require('../../../services/arango')
const aql = require('arangojs').aql;
const helperFunctions = require('./date-formatter');

async function getChartMetrics(company, startDate, endDate) {
    var startDate = helperFunctions.getStartOfDayUTCTimestampDateObject(startDate);

    var endDate = helperFunctions.getEndOfDayUTCTimestampDateObject(endDate);
    let companyInfo = await Companies.find().where({ _id: company }).one().limit(1);
    if (companyInfo) {
        console.log("************** Rubi Chart Metrics **************")
        for (var reportingProvider of companyInfo.reportingProviders) {
            if (reportingProvider.reportingProvider == "rubi") {
                return new Promise((resolve, reject) => {
                    try {
                        db.query(`
                                LET revenuePerDay = ( // subquery start
                                    FOR r IN rubi_stat_reports
                                        FILTER r.date >= ${startDate} && r.date <= ${endDate}
                                        COLLECT date = r.date
                                        AGGREGATE revenuePerDay = SUM(TO_NUMBER(r.revenue))
                                        RETURN revenuePerDay
                                    )
                                LET publisherRevenuePerDay = ( // subquery start
                                    FOR r IN rubi_stat_reports
                                        FILTER r.date >= ${startDate} && r.date <= ${endDate}
                                        COLLECT date = r.date
                                        AGGREGATE publisherRevenuePerDay = SUM(TO_NUMBER(r.revenue*r.split/100))
                                        RETURN publisherRevenuePerDay
                                    )
            
                                LET datesOfRevenue = ( // subquery start
                                    FOR r IN rubi_stat_reports
                                        FILTER r.date >= ${startDate} && r.date <= ${endDate}
                                        COLLECT date = r.date
                                        RETURN date
                                    )
            
                                LET searchesPerDay = ( // subquery start
                                    FOR r IN rubi_stat_reports
                                        FILTER r.date >= ${startDate} && r.date <= ${endDate}
                                        COLLECT date = r.date
                                        AGGREGATE searchesPerDay = SUM(TO_NUMBER(r.total_searches))
                                        RETURN searchesPerDay
                                    )
            
                                RETURN { revenuePerDay, publisherRevenuePerDay,  datesOfRevenue, searchesPerDay }
                            `)
                            .then(cursor => {
                                return cursor.map(t => {
                                    return t;
                                })
                            })
                            .then(keys => {
                                resolve(keys[0]);
                            })
                            .catch(err => {
                                console.log('Inner catch error...')
                                console.log(err);
                                reject(err);
                            })
                    } catch (err) {
                        console.log(err)
                    }
                })
            }
        }
    }

}

//Get Rubi Stat
async function getRubiStat(company, start, end) {
    startDate = moment.utc(start, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(end, "MM-DD-YYYY").endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN rubi_stat_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} COLLECT date = doc.date, subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.total_searches)), clicks = SUM(TO_NUMBER(doc.clicks)), monetized_searches = SUM(TO_NUMBER(doc.monetized_searches)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date DESC RETURN {date, subid, revenue, clicks, searches, monetized_searches, split, profit: (100-split)*revenue/100, publisherNet: revenue*split/100 }`)
                .then(cursor => {
                    return cursor.map(ru => {
                        return ru;
                    })

                })
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    console.log('Inner catch error...')
                    console.log(err);
                    reject(err);
                })
        } catch (error) {
            console.log(error)
        }
    })
}

//Get Rubi Stat for publisher
async function getPublisherRubiStat(company, start, end) {
    startDate = moment.utc(start, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(end, "MM-DD-YYYY").endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN rubi_stat_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} FOR tag IN tags FILTER tag.advertiser == "rubi" FOR ts IN tag.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.total_searches)), clicks = SUM(TO_NUMBER(doc.clicks)), monetized_searches = SUM(TO_NUMBER(doc.monetized_searches)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date, TO_NUMBER(subid) DESC RETURN {date, subid, revenue: revenue*split/100, clicks, searches, ctr: clicks/searches, cpc: revenue*split/100/clicks }`)
                .then(cursor => {
                    return cursor.map(ru => {
                        // console.log(ru)
                        return ru;
                    })

                })
                .then(keys => {
                    // console.log('keys')
                    resolve(keys);
                })
                .catch(err => {
                    console.log('Inner catch error...')
                    console.log(err);
                    reject(err);
                })
        } catch (error) {
            console.log(error)
        }
    })
}

//get Rubi Summary Metrics
async function getSummaryMetrics(company, startDate, endDate) {
    let start = moment.utc(startDate, "MM-DD-YYYY").startOf('day').toDate().getTime();
    let end = moment.utc(endDate, "MM-DD-YYYY").endOf('day').toDate().getTime();
    let selectedDiff = moment.utc(endDate, "MM-DD-YYYY").diff(moment.utc(startDate, "MM-DD-YYYY"), "days");
    let prevStart = moment.utc(startDate, "MM-DD-YYYY").subtract(selectedDiff, "days").startOf('day').toDate().getTime();
    let prevEnd = moment.utc(endDate, "MM-DD-YYYY").subtract(selectedDiff, "days").endOf('day').toDate().getTime();
    //Gets the starting day of the month UTC MS Timestamp
    let startOfCurrentMonth = moment().utc().startOf('month').toDate().getTime();
    //Gets the end of month day of the month UTC MS Timestamp
    let endOfCurrentMonth = moment().utc().endOf('month').toDate().getTime();
    let dayInCurrentMonth = moment(startOfCurrentMonth).daysInMonth();
    let startOfBeforeMonth = moment().subtract(1, 'months').utc().startOf('month').toDate().getTime();
    let endOfBeforeMonth = moment().subtract(1, 'months').utc().endOf('month').toDate().getTime();
    let dayInBeforeMonth = moment(startOfBeforeMonth).daysInMonth();
    let startOfTwoBeforeMonth = moment().subtract(2, 'months').utc().startOf('month').toDate().getTime();
    let endOfTwoBeforeMonth = moment().subtract(2, 'months').utc().endOf('month').toDate().getTime();
    let dayInTwoBeforeMonth = moment(startOfTwoBeforeMonth).daysInMonth();
    return new Promise((resolve, reject) => {
        try {
            db.query(`
                LET summaryMetrics = (
                    FOR t IN rubi_stat_reports
                        FILTER t.date >= ${startOfCurrentMonth} && t.date <= ${endOfCurrentMonth} 
                        COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
                        RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${dayInCurrentMonth}, profitPace: (profit/reportedDays) * ${dayInCurrentMonth}}
                    )
                LET  lastMonthStat = (
                    FOR t IN rubi_stat_reports
                        FILTER t.date >= ${startOfBeforeMonth} && t.date <= ${endOfBeforeMonth}
                        COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
                        RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${dayInBeforeMonth}, profitPace: (profit/reportedDays) * ${dayInBeforeMonth}}
                    )
                LET  twoLastMonthStat = (
                    FOR t IN rubi_stat_reports
                        FILTER t.date >= ${startOfTwoBeforeMonth} && t.date <= ${endOfTwoBeforeMonth}
                        COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
                        RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${dayInTwoBeforeMonth}, profitPace: (profit/reportedDays) * ${dayInTwoBeforeMonth}}
                    )
                LET  selectedStat = (
                    FOR t IN rubi_stat_reports
                        FILTER t.date >= ${start} && t.date <= ${end}
                        COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
                        RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${selectedDiff}, profitPace: (profit/reportedDays) * ${selectedDiff}}
                    )
                LET  prevSelectedStat = (
                    FOR t IN rubi_stat_reports
                        FILTER t.date >= ${prevStart} && t.date <= ${prevEnd}
                        COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
                        RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${selectedDiff}, profitPace: (profit/reportedDays) * ${selectedDiff}}
                    )
                
                RETURN { summaryMetrics, lastMonthStat, twoLastMonthStat, selectedStat, prevSelectedStat }
            `)
                .then(cursor => {
                    return cursor.map(t => {
                        return t;
                    })
                })
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    console.log('Inner catch error...')
                    console.log(err);
                    reject(err);
                })
        } catch (err) {
            console.log(err)
        }
    });
}

module.exports = {
    getChartMetrics,
    getRubiStat,
    getSummaryMetrics,
    getPublisherRubiStat
};