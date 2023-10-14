var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const { db } = require('../../../services/arango');
const lyonsFunctions = require('../helpers/lyon-scraper');
var axios = require('axios');
var moment = require('moment');
const aql = require('arangojs').aql;

router.use(auth);

//Gets summary row for lyon stats
router.get('/summary_metrics', async (req, res) => {
  console.log('Summary Metrics Route')
  const { company, startDate, endDate } = req.query;
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
  try {
    let aql = `
      LET summaryMetrics = (
        FOR t IN lyon_stat_reports
            FILTER t.date >= ${startOfCurrentMonth} && t.date <= ${endOfCurrentMonth} 
            COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
            RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${dayInCurrentMonth}, profitPace: (profit/reportedDays) * ${dayInCurrentMonth}}
        )
      LET  lastMonthStat = (
          FOR t IN lyon_stat_reports
              FILTER t.date >= ${startOfBeforeMonth} && t.date <= ${endOfBeforeMonth}
              COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
              RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${dayInBeforeMonth}, profitPace: (profit/reportedDays) * ${dayInBeforeMonth}}
          )
      LET  twoLastMonthStat = (
          FOR t IN lyon_stat_reports
              FILTER t.date >= ${startOfTwoBeforeMonth} && t.date <= ${endOfTwoBeforeMonth}
              COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
              RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${dayInTwoBeforeMonth}, profitPace: (profit/reportedDays) * ${dayInTwoBeforeMonth}}
          )
      LET  selectedStat = (
          FOR t IN lyon_stat_reports
              FILTER t.date >= ${start} && t.date <= ${end}
              COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
              RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${selectedDiff}, profitPace: (profit/reportedDays) * ${selectedDiff}}
          )
      LET  prevSelectedStat = (
          FOR t IN lyon_stat_reports
              FILTER t.date >= ${prevStart} && t.date <= ${prevEnd}
              COLLECT AGGREGATE revenue = SUM(TO_NUMBER(t.revenue)), profit = SUM(TO_NUMBER(t.revenue) * ((100 - t.split) * 0.01)), reportedDays = COUNT_DISTINCT(t.date)
              RETURN {revenue, profit, revenuePace: (revenue/reportedDays) * ${selectedDiff}, profitPace: (profit/reportedDays) * ${selectedDiff}}
          )
  
      RETURN { summaryMetrics, lastMonthStat, twoLastMonthStat, selectedStat, prevSelectedStat }
      `
    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.status(200).send({summary: result});
  } catch (err) {
    res.status(500).send(err)
  }
});

//Gets summary row for lyon stats
router.get('/chart_metrics', async (req, res, next) => {
  console.log('Chart Metrics')
  const { company } = req.query;
  const { startDate } = req.query;
  const { endDate } = req.query;
  let summary = await lyonsFunctions.getChartMetrics(company, startDate, endDate);
  if (summary) {
    res.status(200).send({ revenuePerDay: summary.revenuePerDay, publisherRevenuePerDay: summary.publisherRevenuePerDay, datesOfRevenue: summary.datesOfRevenue, searchesPerDay: summary.searchesPerDay })
  }
});

//Updates All Lyon Stats
//Route: /stats/admin/update/lyon/all
//Params:
//startDate (required): MM-YYYY-DD
//endDate (required): MM-YYYY-DD
//companyCredentials (required):
router.put('/', async (req, res, next) => {
  //console.log(req.params);
  console.log('/stats/admin/lyon/ UPDATING...')
  let stats = await lyonsFunctions.getRawLyonStats();
  console.log('Got Lyon Stats!')
  let completedDocs = await lyonsFunctions.updateDocuments('lyon', stats);
  console.log('Completed UPSERT!')
  res.status(200).send({ stats: completedDocs });
});

router.get('/test-all', async (req, res, next) => {
  try {
    let aql = `FOR doc IN lyon_stat_reports RETURN doc`
    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err)
  }

});

router.post('/day-to-day', async (req, res, next) => {
  const { start_date, end_date } = req.body
  let cron_start_date = moment.utc(start_date).format("YYYY-MM-DD");
  let cron_end_date = moment.utc(end_date).format("YYYY-MM-DD");
  var lyonData = [];
  var config = {
    method: 'get',
    url: `http://rt.api.imageadvantage.net/PublisherAPIReports/?StartDate=${cron_start_date}&EndDate=${cron_end_date}&Key=8r4nd(1!(k494!&ReportType=0`,
    headers: {}
  };
  axios(config)
    .then(function (response) {
      var respond_data = response.data.split(/\r?\n/);
      for (var i = 1; i < respond_data.length - 1; i++) {
        var subdata = respond_data[i].split(',');
        let stat = {}
        stat = {
          date: moment.utc(subdata[0], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
          ma: subdata[1],
          subid: subdata[2] + "_" + subdata[3],
          searches: subdata[4],
          biddedSearches: subdata[5],
          clicks: subdata[6],
          biddedCTR: subdata[7],
          ctr: subdata[8],
          split: 0,
          revenue: subdata[9],
          tqScore: subdata[10],
        }

        lyonData.push(stat);
      }
      try {
        db.query(aql`FOR stat IN ${lyonData} INSERT stat INTO lyon_stat_reports`);

      } catch (err) {
        return res.status(500).send('Error adding Lyon Stat: ' + err)
      }
      return res.status(200).send("ok");
    })
    .catch(function (error) {
      return res.status(500).send('Error adding Lyon Stat: ' + error)
    });

});

router.delete('/all-delete', async (req, res, next) => {
  try {
    let aql = `FOR doc IN lyon_stat_reports REMOVE doc IN lyon_stat_reports`
    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err)
  }

});

router.get("/all", async (req, res, next) => {
  let { startDate, endDate } = req.query;
  var start = moment.utc(startDate, "MM-DD-YYYY").startOf('day').toDate().getTime();
  var end = moment.utc(endDate, "MM-DD-YYYY").endOf('day').toDate().getTime();
  let aql = `FOR doc IN lyon_stat_reports FILTER doc.date >= ${start} && doc.date <= ${end} COLLECT date = doc.date, subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), biddedSearches = SUM(TO_NUMBER(doc.biddedSearches)), clicks = SUM(TO_NUMBER(doc.clicks)), ctr = SUM(TO_NUMBER(doc.ctr)), biddedCtr = SUM(TO_NUMBER(doc.biddedCTR)), split = AVERAGE(TO_NUMBER(doc.split))
  SORT date DESC, TO_NUMBER(subid)
  RETURN { date, subid, clicks,  ctr, revenue: revenue, cpc: revenue/clicks, searches, biddedCtr, biddedSearches, split, profit: (100-split)*revenue/100, publisherNet: revenue*split/100 }`

  const cursor = await db.query(aql);
  let result = await cursor.all();
  return res.status(200).send(result);
});

router.get("/all-publishers", async (req, res, next) => {
  let { startDate, endDate } = req.query;
  var start = moment.utc(startDate, "MM-DD-YYYY").startOf('day').toDate().getTime();
  var end = moment.utc(endDate, "MM-DD-YYYY").endOf('day').toDate().getTime();
  let aql = `FOR doc IN lyon_stat_reports FILTER doc.date >= ${start} && doc.date <= ${end} FOR tag IN tags FILTER tag.advertiser == "lyons" FOR ts IN tag.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), biddedSearches = SUM(TO_NUMBER(doc.biddedSearches)), clicks = SUM(TO_NUMBER(doc.clicks)), ctr = SUM(TO_NUMBER(doc.ctr)), biddedCtr = SUM(TO_NUMBER(doc.biddedCTR)), split = AVERAGE(TO_NUMBER(doc.split))
  SORT date, TO_NUMBER(subid) DESC
  RETURN { date, clicks, subid, ctr, revenue: revenue*split/100, cpc: revenue*split/100/clicks, searches }`

  const cursor = await db.query(aql);
  let result = await cursor.all();
  return res.status(200).send(result);
});

router.get("/all-stat", async (req, res, next) => {
  //Gets the starting day of the month UTC MS Timestamp
  let startOfCurrentMonth = moment().utc().subtract(30, 'days').startOf('day').toDate().getTime();
  //Gets the end of month day of the month UTC MS Timestamp
  let endOfCurrentMonth = moment().utc().endOf('day').toDate().getTime();
  let startOfBeforeMonth = moment().utc().subtract(60, 'days').startOf('day').toDate().getTime();
  let endOfBeforeMonth = moment().utc().subtract(30, 'days').endOf('day').toDate().getTime();

  let aql = `LET currentStat = (FOR r IN lyon_stat_reports FILTER r.date >= ${startOfCurrentMonth} && r.date <= ${endOfCurrentMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) LET beforeStat = (FOR r IN lyon_stat_reports FILTER r.date >= ${startOfBeforeMonth} && r.date <= ${endOfBeforeMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) RETURN {currentStat, beforeStat}`

  const cursor = await db.query(aql)
  let result = await cursor.all()
  return res.status(200).send(result)
});

module.exports = router;