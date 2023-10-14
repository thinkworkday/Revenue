var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const system1Functions = require('../helpers/system1-scraper')
var moment = require('moment');
const { db } = require('../../../services/arango');
const aql = require('arangojs').aql;
var axios = require('axios');

router.use(auth);

//get all system1 stats
router.get('/', async (req, res, next) => {
  const { company, startDate, endDate } = req.query;
  let stats = await system1Functions.getSystem1Stat(company, startDate, endDate);
  if (stats) {
    res.status(200).send({ stats: stats })
  }
});

//get dashboard show system1
router.get("/all-stat", async (req, res, next) => {
  //Gets the starting day of the month UTC MS Timestamp
  let startOfCurrentMonth = moment().utc().subtract(30, 'days').startOf('day').toDate().getTime();
  //Gets the end of month day of the month UTC MS Timestamp
  let endOfCurrentMonth = moment().utc().endOf('day').toDate().getTime();
  let startOfBeforeMonth = moment().utc().subtract(60, 'days').startOf('day').toDate().getTime();
  let endOfBeforeMonth = moment().utc().subtract(30, 'days').endOf('day').toDate().getTime();

  let aql = `LET currentStat = (FOR r IN system1_stat_reports FILTER r.date >= ${startOfCurrentMonth} && r.date <= ${endOfCurrentMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) LET beforeStat = (FOR r IN system1_stat_reports FILTER r.date >= ${startOfBeforeMonth} && r.date <= ${endOfBeforeMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) RETURN {currentStat, beforeStat}`

  const cursor = await db.query(aql)
  let result = await cursor.all()
  return res.status(200).send(result)
});

//Gets summary row for System1 stats
router.get('/summary_metrics', async (req, res) => {
  console.log('Summary Metrics Route')
  const { company, startDate, endDate } = req.query;
  let summary = await system1Functions.getSummaryMetrics(company, startDate, endDate);
  if (summary) {
    res.status(200).send({ summary });
  }
});

//manual add system1
router.post('/update-system1', async (req, res) => {
  const { requestDate } = req.body;
  let reqDate = moment.utc(requestDate).format("YYYY-MM-DD");
  var config = {
    method: 'get',
    url: `https://reports.system1.com/v3/ptag?auth_key=lucdJjxo2qqkeerBY0Oh&days=${reqDate}&format=json`,
    headers: {}
  };
  axios(config)
    .then(async function (response) {
      var resData = response.data;
      var system1Data = [];
      for (var i = 1; i < resData.length - 1; i++) {
        var stat = {
          date: moment.utc(resData[i][0], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
          subid: resData[i][1],
          device: resData[i][2],
          country: resData[i][3],
          searches: resData[i][4],
          clicks: resData[i][6],
          revenue: resData[i][7],
          split: 0
        }
        system1Data.push(stat)
      }
      try {
        await db.query(aql`FOR stat IN ${system1Data} INSERT stat INTO system1_stat_reports`);
      } catch (error) {
        console.log(error)
        return res.status(500).send(error)
      }
      console.log("System1 Add And Update End!");
      res.status(200).send("ok");
    })
    .catch(function (error) {
      console.log(error);
      return res.status(404).send(error.message)
    });
})

router.get("/all-publishers", async (req, res, next) => {
  const { company, startDate, endDate } = req.query;
  let stats = await system1Functions.getPublisherSystem1Stat(company, startDate, endDate);
  if (stats) {
    res.status(200).send({ stats: stats })
  }
});

module.exports = router;