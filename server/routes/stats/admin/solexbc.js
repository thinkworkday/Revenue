var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const solexbcFunctions = require('../helpers/solexbc-scraper')
var moment = require('moment');
const { db, Companies } = require('../../../services/arango');
const aql = require('arangojs').aql;
var axios = require('axios');

router.use(auth);

//get all solexbc stats
router.get('/', async (req, res) => {
    const { company, startDate, endDate } = req.query;
    let stats = await solexbcFunctions.getSolexBCStat(company, startDate, endDate);
    if (stats) {
        res.status(200).send({ stats: stats })
    }
});

//Gets summary row for SolexBC stats
router.get('/chart_metrics', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let chartSummary = await solexbcFunctions.getChartMetrics(company, startDate, endDate);
    if (chartSummary) {
        res.status(200).send({ revenuePerDay: chartSummary.revenuePerDay, publisherRevenuePerDay: chartSummary.publisherRevenuePerDay, datesOfRevenue: chartSummary.datesOfRevenue, searchesPerDay: chartSummary.searchesPerDay })
    }
});

//Gets summary row for SolexBC stats
router.get('/summary_metrics', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let summary = await solexbcFunctions.getSummaryMetrics(company, startDate, endDate);
    if (summary) {
        res.status(200).send({ summary });
    }
});

//manual add SolexBC
router.post('/one-by-one', async (req, res, next) => {
    const { start_date, end_date } = req.body;
    let m_start_date = moment.utc(start_date).format("YYYY-MM-DD");
    let m_end_date = moment.utc(end_date).format("YYYY-MM-DD");
    var axiosArray = [];
    var solexBCData = [];
    var solexBaseData = [
        {
            'tagId': '7023.605',
            'secret': 'g27OnPIfHOL5aMVA1VSj6'
        },
        {
            'tagId': '7023.671',
            'secret': '2hy0Mc8BvNo5HOfndbV08'
        },
        {
            'tagId': '7023.743',
            'secret': '1ErYV2YoNAQJ4a7QRIyLe'
        },
        {
            'tagId': '7023.827',
            'secret': 'ETXTJfXq0RWsLEwwcVM91'
        },
    ];
    for (var solexBase of solexBaseData) {
        axiosArray.push(axios({
            method: 'get',
            url: `https://r.a9g.io/r/v1?s=${solexBase.tagId}&k=${solexBase.secret}&start=${m_start_date}&end=${m_end_date}`,
            headers: {}
        }))
    }
    try {
        const resData = await axios.all(axiosArray);
        for (var resp of resData) {
            for (var i = 1; i < resp.data.split(/\r\n|\n/).length - 1; i++) {
                var subData = resp.data.split(/\r\n|\n/)[i].split(',');
                let stat = {};
                stat = {
                    date: moment.utc(subData[0].replace('"', ''), "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                    subid: subData[1].replace('"', '').replace('\"', ''),
                    country: subData[2].replace('"', '').replace('\"', ''),
                    searches: subData[3].replace('"', ''),
                    searchesPaid: subData[4].replace('"', ''),
                    clicks: subData[6].replace('"', ''),
                    revenue: subData[7].replace('"', ''),
                    split: 0
                }
                solexBCData.push(stat);
            }
        }

        try {
            db.query(aql`FOR doc IN ${solexBCData} UPSERT { date: doc.date, subid: doc.subid, country: doc.country } INSERT doc UPDATE doc IN solexbc_stat_reports`);
        } catch (error) {
            return res.status(500).send('Error adding Solexbc Stat: ' + error);
        }
        return res.status(200).send("ok");
    } catch (error) {
        return res.status(500).send('Error adding Solexbc Stat: ' + error);
    }

});

router.get("/all-publishers", async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await solexbcFunctions.getPublisherSolexbcStat(company, startDate, endDate);
    if (stats) {
        return res.status(200).send({ stats: stats })
    }
});

//get dashboard show SolexBC
router.get("/all-stat", async (req, res, next) => {
    //Gets the starting day of the month UTC MS Timestamp
    let startOfCurrentMonth = moment().utc().subtract(30, 'days').startOf('day').toDate().getTime();
    //Gets the end of month day of the month UTC MS Timestamp
    let endOfCurrentMonth = moment().utc().endOf('day').toDate().getTime();
    let startOfBeforeMonth = moment().utc().subtract(60, 'days').startOf('day').toDate().getTime();
    let endOfBeforeMonth = moment().utc().subtract(30, 'days').endOf('day').toDate().getTime();

    let aql = `LET currentStat = (FOR r IN solexbc_stat_reports FILTER r.date >= ${startOfCurrentMonth} && r.date <= ${endOfCurrentMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) LET beforeStat = (FOR r IN solexbc_stat_reports FILTER r.date >= ${startOfBeforeMonth} && r.date <= ${endOfBeforeMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) RETURN {currentStat, beforeStat}`

    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.status(200).send(result)
});

module.exports = router;