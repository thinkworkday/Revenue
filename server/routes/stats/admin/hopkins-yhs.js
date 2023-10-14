var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const hopkinFunctions = require('../helpers/hopkin-scraper')
var moment = require('moment');
const { db } = require('../../../services/arango');
const aql = require('arangojs').aql;

router.use(auth);

//Gets chart for Hopkins
router.get('/chart_metrics', async (req, res, next) => {
  console.log('Chart Hopkins Metrics')
  const { company, startDate, endDate } = req.query;
  let chartSummary = await hopkinFunctions.getChartMetrics(company, startDate, endDate);
  if (chartSummary) {
    res.status(200).send({ revenuePerDay: chartSummary.revenuePerDay, publisherRevenuePerDay: chartSummary.publisherRevenuePerDay, datesOfRevenue: chartSummary.datesOfRevenue, searchesPerDay: chartSummary.searchesPerDay })
  }
});

//get all Hopkins stats
router.get('/', async (req, res) => {
  const { company, startDate, endDate } = req.query;
  let stats = await hopkinFunctions.getHopkinStat(company, startDate, endDate);
  if (stats) {
    res.status(200).send({ stats: stats })
  }
});

router.get("/all-publishers", async (req, res) => {
  const { company, startDate, endDate } = req.query;
  let stats = await hopkinFunctions.getPublisherHopkinStat(company, startDate, endDate);
  if (stats) {
    res.status(200).send({ stats: stats })
  }
});

//Gets summary row for Hopkins stats
router.get('/summary_metrics', async (req, res) => {
  console.log('Summary Metrics Route')
  const { company, startDate, endDate } = req.query;
  let summary = await hopkinFunctions.getSummaryMetrics(company, startDate, endDate);
  if (summary) {
    res.status(200).send({ summary });
  }
});

//get dashboard show Hopkins
router.get("/all-stat", async (req, res, next) => {
  //Gets the starting day of the month UTC MS Timestamp
  let startOfCurrentMonth = moment().utc().subtract(30, 'days').startOf('day').toDate().getTime();
  //Gets the end of month day of the month UTC MS Timestamp
  let endOfCurrentMonth = moment().utc().endOf('day').toDate().getTime();
  let startOfBeforeMonth = moment().utc().subtract(60, 'days').startOf('day').toDate().getTime();
  let endOfBeforeMonth = moment().utc().subtract(30, 'days').endOf('day').toDate().getTime();

  let aql = `LET currentStat = (FOR r IN hopkin_stat_reports FILTER r.date >= ${startOfCurrentMonth} && r.date <= ${endOfCurrentMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) LET beforeStat = (FOR r IN hopkin_stat_reports FILTER r.date >= ${startOfBeforeMonth} && r.date <= ${endOfBeforeMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) RETURN {currentStat, beforeStat}`

  const cursor = await db.query(aql)
  let result = await cursor.all()
  return res.status(200).send(result)
});

module.exports = router;