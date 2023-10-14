var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const rubiFunctions = require('../helpers/rubi-scraper')
var moment = require('moment');
const { db } = require('../../../services/arango');
const aql = require('arangojs').aql;
var axios = require('axios');

router.use(auth);

//Gets chart for Rubi
router.get('/chart_metrics', async (req, res) => {
  console.log('Chart Rubi Metrics')
  const { company, startDate, endDate } = req.query;
  let chartSummary = await rubiFunctions.getChartMetrics(company, startDate, endDate);
  if (chartSummary) {
    res.status(200).send({ revenuePerDay: chartSummary.revenuePerDay, publisherRevenuePerDay: chartSummary.publisherRevenuePerDay, datesOfRevenue: chartSummary.datesOfRevenue, searchesPerDay: chartSummary.searchesPerDay })
  }
});

//get all rubi stats
router.get('/', async (req, res) => {
  const { company, startDate, endDate } = req.query;
  let stats = await rubiFunctions.getRubiStat(company, startDate, endDate);
  if (stats) {
    res.status(200).send({ stats: stats })
  }
});

router.get("/all-publishers", async (req, res, next) => {
  const { company, startDate, endDate } = req.query;
  let stats = await rubiFunctions.getPublisherRubiStat(company, startDate, endDate);
  if (stats) {
    res.status(200).send({ stats: stats })
  }
});

//Gets summary row for rubi stats
router.get('/summary_metrics', async (req, res) => {
  console.log('Summary Metrics Route')
  const { company, startDate, endDate } = req.query;
  let summary = await rubiFunctions.getSummaryMetrics(company, startDate, endDate);
  if (summary) {
    res.status(200).send({ summary });
  }
});

//manual add rubi
router.post('/one-day-by-one-day', async (req, res, next) => {
  const { start_date, end_date } = req.body
  let m_start_date = moment.utc(start_date).format("YYYY-MM-DD");
  let m_end_date = moment.utc(end_date).format("YYYY-MM-DD");
  var config = {
    method: 'get',
    url: `https://publisher.aka-api.com/api/publisher/reports?apiKey=b8ccd84e-345b-4196-b09b-c60e4c2ab1a9&format=json&fromDate=${m_start_date}&toDate=${m_end_date}`,
    headers: {}
  };
  axios(config)
    .then(function (response) {
      let rubiData = [];
      for (var res_data of response.data) {
        if (res_data.rows.length > 0) {
          for (var subData of res_data.rows) {
            var stat = {
              date: moment.utc(subData.Date, "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
              publisher: subData.Publisher,
              subid: subData.SubID,
              geo: subData.GEO,
              total_searches: subData['Total Searches'],
              monetized_searches: subData['MonetizedSearches'],
              clicks: subData.Clicks,
              revenue: subData["Net Revenue"],
              split: 0
            }
            rubiData.push(stat)
          }
        }
      }

      try {
        db.query(aql`FOR stat IN ${rubiData} UPSERT { date: stat.date, subid: stat.subid } INSERT stat UPDATE stat IN rubi_stat_reports`);

      } catch (error) {
        console.log(err)
      }
      console.log("Rubi Add And Update End!")
    })
    .catch(function (error) {
      console.log(error);
    });

});

//get dashboard show rubi
router.get("/all-stat", async (req, res, next) => {
  //Gets the starting day of the month UTC MS Timestamp
  let startOfCurrentMonth = moment().utc().subtract(30, 'days').startOf('day').toDate().getTime();
  //Gets the end of month day of the month UTC MS Timestamp
  let endOfCurrentMonth = moment().utc().endOf('day').toDate().getTime();
  let startOfBeforeMonth = moment().utc().subtract(60, 'days').startOf('day').toDate().getTime();
  let endOfBeforeMonth = moment().utc().subtract(30, 'days').endOf('day').toDate().getTime();

  let aql = `LET currentStat = (FOR r IN rubi_stat_reports FILTER r.date >= ${startOfCurrentMonth} && r.date <= ${endOfCurrentMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) LET beforeStat = (FOR r IN rubi_stat_reports FILTER r.date >= ${startOfBeforeMonth} && r.date <= ${endOfBeforeMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) RETURN {currentStat, beforeStat}`

  const cursor = await db.query(aql)
  let result = await cursor.all()
  return res.status(200).send(result)
});

module.exports = router;