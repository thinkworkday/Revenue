const moment = require('moment');
const { db, Companies } = require('../../../services/arango')
const aql = require('arangojs').aql;

//Get Rubi Stat
async function getSystem1Stat(company, start, end) {
    startDate = moment(start, "MM-DD-YYYY").utc().startOf('day').toDate().getTime();
    endDate = moment(end, "MM-DD-YYYY").utc().endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN system1_stat_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} COLLECT date = doc.date, subid = doc.subid, device = doc.device AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), clicks = SUM(TO_NUMBER(doc.clicks)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date DESC RETURN {date, subid, device, revenue, clicks, searches, split, profit: (100-split)*revenue/100, publisherNet: revenue*split/100 }`)
                .then(cursor => {
                    return cursor.map(system => {
                        // console.log(system)
                        return system;
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

//Get System1 Stat for publisher
async function getPublisherSystem1Stat(company, start, end) {
    startDate = moment.utc(start, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(end, "MM-DD-YYYY").endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN system1_stat_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} COLLECT date = doc.date, subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), searches = SUM(TO_NUMBER(doc.searches)), clicks = SUM(TO_NUMBER(doc.clicks)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date DESC RETURN {date, subid, revenue, clicks, searches, ctr: clicks/searches, cpc: revenue*split/100/clicks }`)
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
                    FOR t IN system1_stat_reports
                        FILTER t.date >= ${startOfCurrentMonth} && t.date <= ${endOfCurrentMonth} 
                        COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
                        RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${dayInCurrentMonth}, profitPace: (profit/reportedDays) * ${dayInCurrentMonth}}
                    )
                LET  lastMonthStat = (
                    FOR t IN system1_stat_reports
                        FILTER t.date >= ${startOfBeforeMonth} && t.date <= ${endOfBeforeMonth}
                        COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
                        RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${dayInBeforeMonth}, profitPace: (profit/reportedDays) * ${dayInBeforeMonth}}
                    )
                LET  twoLastMonthStat = (
                    FOR t IN system1_stat_reports
                        FILTER t.date >= ${startOfTwoBeforeMonth} && t.date <= ${endOfTwoBeforeMonth}
                        COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
                        RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${dayInTwoBeforeMonth}, profitPace: (profit/reportedDays) * ${dayInTwoBeforeMonth}}
                    )
                LET  selectedStat = (
                    FOR t IN system1_stat_reports
                        FILTER t.date >= ${start} && t.date <= ${end}
                        COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
                        RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${selectedDiff}, profitPace: (profit/reportedDays) * ${selectedDiff}}
                    )
                LET  prevSelectedStat = (
                    FOR t IN system1_stat_reports
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
    getSystem1Stat,
    getPublisherSystem1Stat,
    getSummaryMetrics,
};