var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const { db } = require('../../../services/arango');
var moment = require('moment');
var axios = require('axios');
const aql = require('arangojs').aql;
const monarchApptitudeFunctions = require('../helpers/monarch-apptitude-scraper');

router.use(auth);

//get all monarch apptitude stats
router.get('/', async (req, res, next) => {
    //console.log(req.query)
    const { company, startDate, endDate } = req.query;
    let stats = await monarchApptitudeFunctions.getMonarchApptitudeStat(company, startDate, endDate);
    if (stats) {
        res.status(200).send({ stats: stats })
    }
});

//Gets summary row for Apptitude stats
router.get('/chart_metrics', async (req, res, next) => {
    console.log('Chart Monarch Apptitude Metrics')
    const { company, startDate, endDate } = req.query;

    let chartSummary = await monarchApptitudeFunctions.getChartMetrics(company, startDate, endDate);
    if (chartSummary) {
        res.status(200).send({ revenuePerDay: chartSummary.revenuePerDay, publisherRevenuePerDay: chartSummary.publisherRevenuePerDay, datesOfRevenue: chartSummary.datesOfRevenue, searchesPerDay: chartSummary.searchesPerDay })
    }
});

//Gets summary row for Apptitude stats
router.get('/summary_metrics', async (req, res) => {
    console.log('Summary Metrics Route')
    const { company, startDate, endDate } = req.query;
    let summary = await monarchApptitudeFunctions.getSummaryMetrics(company, startDate, endDate);
    if (summary) {
        res.status(200).send({ summary });
    }
});

router.post('/day-to-day', async (req, res, next) => {
    const { start_date, end_date } = req.body
    let cron_start_date = moment.utc(start_date).format("YYYY-MM-DD");
    let cron_end_date = moment.utc(end_date).format("YYYY-MM-DD");
    var monarchApptitudeData = [];
    var body = {
        startDate: cron_start_date,
        endDate: cron_end_date,
        formcodes: [],
        markets: [],
        ptagIds: [],
        dataSource: "ptagreporting",
        dataFormat: "rawcsv",
        dataFormatOptions: {
            columns_header: true,
            quoted_fields: false,
            field_delimiter: ",",
            record_delimiter: "\n"
        }
    }
    var data = JSON.stringify(body);
    var config = {
        method: 'post',
        url: 'https://searchapi.sien.com/api/v2/ATMD/searchdata',
        headers: {
            'User': 'monarchdigital_prog',
            'ApiKey': '662cb41993bc515b44cd9da1219a3ade459010621',
            'Content-Type': 'application/json'
        },
        data: data
    };

    var data = JSON.stringify(body);

    axios(config)
        .then(async function (response) {
            var respond_data = response.data.split(/\r?\n/);

            for (var i = 1; i < respond_data.length; i++) {
                var subdata = respond_data[i].split(',');
                let stat = {}
                stat = {
                    date: moment.utc(subdata[0], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                    partner: subdata[1],
                    formcode: subdata[2],
                    subid: subdata[3],
                    country: subdata[4],
                    clicks: subdata[5],
                    searches: subdata[6],
                    rsearches: subdata[7],
                    filtering: subdata[8],
                    revenue: Math.abs(subdata[9]),
                    adimpressions: subdata[10],
                    rpm: Math.abs(subdata[11]),
                    cpc: subdata[12],
                    adctr: subdata[13],
                    isfollowon: subdata[14],
                    browser: subdata[15],
                    devicetype: subdata[16],
                    websitecountry: subdata[17],
                    split: 0,
                }

                monarchApptitudeData.push(stat);

            }
            try {
                await db.query(aql`FOR stat IN ${monarchApptitudeData} INSERT stat INTO monarch_apptitudes`);

            } catch (error) {
                return res.status(500).send('Error adding Monarch Stat: ' + error)
            }
            return res.status(200).send("ok");
        })
        .catch(function (error) {
            return res.status(500).send('Error adding Monarch Stat: ' + error)
        });

});

router.get("/all-publishers", async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await monarchApptitudeFunctions.getPublisherApptitudeStat(company, startDate, endDate);
    if (stats) {
        return res.status(200).send({ stats: stats })
    }
});

//get dashboard show Apptitude
router.get("/all-stat", async (req, res, next) => {
    //Gets the starting day of the month UTC MS Timestamp
    let startOfCurrentMonth = moment().utc().subtract(30, 'days').startOf('day').toDate().getTime();
    //Gets the end of month day of the month UTC MS Timestamp
    let endOfCurrentMonth = moment().utc().endOf('day').toDate().getTime();
    let startOfBeforeMonth = moment().utc().subtract(60, 'days').startOf('day').toDate().getTime();
    let endOfBeforeMonth = moment().utc().subtract(30, 'days').endOf('day').toDate().getTime();

    let aql = `LET currentStat = (FOR r IN monarch_apptitudes FILTER r.date >= ${startOfCurrentMonth} && r.date <= ${endOfCurrentMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) LET beforeStat = (FOR r IN monarch_apptitudes FILTER r.date >= ${startOfBeforeMonth} && r.date <= ${endOfBeforeMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) RETURN {currentStat, beforeStat}`

    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.status(200).send(result)
});

module.exports = router;