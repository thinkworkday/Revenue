var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const perionFunctions = require('../helpers/perion-scraper')
var moment = require('moment');
const { db, Companies } = require('../../../services/arango');
const request = require('request');
const aql = require('arangojs').aql;

router.use(auth);


//Gets summary row for perion stats
router.get('/summary_metrics', async (req, res, next) => {
  console.log('Summary Metrics Route')
  const { company, startDate, endDate } = req.query;
  let summary = await perionFunctions.getSummaryMetrics(company, startDate, endDate);
  if (summary) {
    res.status(200).send({ summary });
  }
});


//Gets summary row for perion stats
router.get('/chart_metrics', async (req, res, next) => {
  console.log('Chart Metrics')
  const { company, startDate, endDate } = req.query;
  let chartSummary = await perionFunctions.getChartMetrics(company, startDate, endDate);
  if (chartSummary) {
    res.status(200).send({ revenuePerDay: chartSummary.revenuePerDay, publisherRevenuePerDay: chartSummary.publisherRevenuePerDay, datesOfRevenue: chartSummary.datesOfRevenue, searchesPerDay: chartSummary.searchesPerDay })
  }
});

//Gets chart for perion stats
router.get('/chart_perion_stat', async (req, res, next) => {
  console.log('Chart Perion Metrics')
  const { company } = req.query;
  let chartSummary = await perionFunctions.getChartStat(company);
  if (chartSummary) {
    res.status(200).send({ revenuePerDay: chartSummary.revenuePerDay, datesOfRevenue: chartSummary.datesOfRevenue, revenueBeforePerDay: chartSummary.revenueBeforePerDay })
  }
});


//Updates All Perion Stats
//Route: /stats/admin/update/perion/all
//Params:
//startDate (required): MM-YYYY-DD
//endDate (required): MM-YYYY-DD
//companyCredentials (required):
router.put('/', async (req, res, next) => {
  const { company, startDate, endDate } = req.body;
  console.log('/stats/admin/perion/ UPDATING...')
  let stats = await perionFunctions.getRawPerionStats(company);
  console.log('Got Perion Stats!')
  perionFunctions.updateDocuments(company, stats);
  console.log('Completed UPSERT!')
  //Perion Split Change
  perionFunctions.updateSplits(company);
  res.status(200).send({ stats: 'ok' });
});

//GET All Perion Stats
//Route: /stats/admin/update/perion/all
//Params:
//startDate (required): MM-YYYY-DD
//endDate (required): MM-YYYY-DD
//companyCredentials (required):
router.get('/', async (req, res, next) => {
  // console.log(req.query)
  const { company, startDate, endDate } = req.query;
  let stats = await perionFunctions.getStats(company, startDate, endDate);
  if (stats) {
    res.status(200).send({ stats: stats })
  }
});

//perion stat about every tag
router.get('/per-tag-stat', async (req, res, next) => {
  const { company, startDate, endDate } = req.query;
  let stats = await perionFunctions.getPerTagStats(company, startDate, endDate);
  if (stats) {
    res.status(200).send(stats);
  };
});


//Test Perion Data Add
router.post('/test-perion', async (req, res, next) => {
  const { start_date, end_date, companyId } = req.body
  console.log('Test Perion Data Add');
  var startDate = moment.utc(start_date).format("YYYY-MM-DD");
  var endDate = moment.utc(end_date).format("YYYY-MM-DD");

  //GET Perion Data From Company
  let companyAql = `FOR company in companies FILTER company._id == "${companyId}" FOR provider IN company.reportingProviders FILTER provider.reportingProvider == "perion" RETURN company`
  try {
    const companyCursor = await db.query(companyAql)
    let companyInformation = await companyCursor.all()
    for (var companyStat of companyInformation) {
      var companyName = companyStat.name;
      for (var companyReportingProvider of companyStat.reportingProviders) {

        if (companyReportingProvider.reportingProvider == "perion") {
          let accessTokenStatus = await getAccessToken();
          let perionData = [];
          if (accessTokenStatus) {
            let token = JSON.parse(accessTokenStatus).access_token;

            var options = {
              'method': 'GET',
              'url': `https://api.codefuel.com/api/performance-data?provider=Bing&start_date=${startDate}&end_date=${endDate}&breakdowns=all&metrics=all&country_codes=all&products=all&channels=all&wallets=all&format=json`,
              'headers': {
                'Authorization': `Bearer ${token}`
              }
            };
            request(options, async function (error, response, body) {
              if (!error && response.statusCode == 200) {
                for (var rowData of JSON.parse(response.body)) {
                  let stat = {};

                  stat = {
                    company_id: `companies/${companyStat._key}`,
                    date: moment.utc(rowData['date'], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                    country_code: rowData['country_code'],
                    country_name: rowData['country_name'],
                    provider: rowData['provider'],
                    subid: rowData['channel'],
                    product: rowData['product'],
                    wallet: rowData['wallet'],
                    revenue: rowData['revenue'],
                    monetized_searches: rowData['monetized_searches'],
                    total_searches: rowData['total_searches'],
                    ad_clicks: rowData['ad_clicks'],
                    cf_initial_searches: rowData['cf_initial_searches'],
                    bing_initial_searches: rowData['bing_initial_searches'],
                    ad_impressions: rowData['ad_impressions'],
                    bing_follow_on_searches: rowData['bing_follow_on_searches'],
                    cpc: rowData['cpc'],
                    ctr: rowData['ctr'],
                    coverage_cf: rowData['coverage_cf'],
                    coverage_bing: rowData['coverage_bing'],
                    follow_on_searches_percentage: rowData['follow_on_searches_percentage'],
                    initial_searches_diff: rowData['initial_searches_diff'],
                    initial_searches_rpm: rowData['initial_searches_rpm'],
                    split: 0
                  }
                  perionData.push(stat);
                }
                let processData = JSON.stringify(perionData);
                let nameChange = companyName.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
                
                let perionCollectionName = (`${nameChange.join("")}_perion_stat_reports`).toString();
                console.log(perionCollectionName)
                try {
                  await db.query(`FOR doc IN ${processData} INSERT doc INTO ${perionCollectionName}`);
                } catch (error) {
                  console.log(error);
                }

              } else {
                console.log(error);
              }
            });
          }
        }

      }
      console.log("====end!======")
    }
    // res.status(200).send("ok");
  } catch (error) {
    console.log('Error: ' + error);
    res.status(400).send({ stats: 'failed', error })
  }

});

//get access token
function getAccessToken() {
  var options = {
    'method': 'POST',
    'url': 'https://auth.codefuel.com/oauth/token',
    'headers': {
      'Content-Type': 'application/json',
      'Cookie': 'did=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU; did_compat=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU'
    },
    body: JSON.stringify({
      "client_id": "U4nmEh6sKLOBa1d1uAIoNOU6YHBOpOwV",
      "client_secret": "Hshi1wMOMsbvz0Qogt9nIiZP9mqdmX8w74YPCIbSv7ih1l1F",
      "audience": "codefuel-api",
      "grant_type": "client_credentials"
    })

  };

  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body)
      } else {
        reject(error);
      }
    });
  });

}

function convertStringToJsonObject(data) {
  return JSON.parse(data);
}

//login Session part
function loginSession(perionEmail, perionPassword, jar, login_headers) {
  return new Promise(function (resolve, reject) {
    request({
      uri: 'https://services.hub.codefuel.com/login',
      method: "POST",
      form: {
        email: perionEmail,
        password: perionPassword
      },
      jar: jar,
      timeout: 60000,
      headers: login_headers,
      followRedirect: true
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //THIS BODY WILL SHOW A REDIRECTING MESSAGE IF SUCCESS, OTHERWISE WILL SPIT OUT LOGIN FORM HTML
        resolve(body);
      } else {
        reject(error);
      }

    })
  })
}

//get data from api
function getDashboardPageData(jar, report_url, report_headers) {
  return new Promise(function (resolve, reject) {
    request({
      uri: report_url,
      method: "GET",
      jar: jar,
      timeout: 20000,
      followRedirect: true,
      maxRedirects: 10,
      headers: report_headers
    }, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        resolve(response.body);
      } else {
        reject(error);
      }

    })
  })
}

router.get("/all-stat", async (req, res, next) => {
  const { company } = req.query;
  //Gets the starting day of the month UTC MS Timestamp
  let startOfCurrentMonth = moment().utc().subtract(30, 'days').startOf('day').toDate().getTime();
  //Gets the end of month day of the month UTC MS Timestamp
  let endOfCurrentMonth = moment().utc().endOf('day').toDate().getTime();
  let startOfBeforeMonth = moment().utc().subtract(60, 'days').startOf('day').toDate().getTime();
  let endOfBeforeMonth = moment().utc().subtract(30, 'days').endOf('day').toDate().getTime();
  let companyInfo = await Companies.find().where({ _id: company }).one().limit(1);
  if (companyInfo) {
    var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
    var perionCollectionName = (`${company_name.join("")}_perion_stat_reports`)

    let aql = `LET currentStat = (FOR r IN ${perionCollectionName} FILTER r.date >= ${startOfCurrentMonth} && r.date <= ${endOfCurrentMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) LET beforeStat = (FOR r IN ${perionCollectionName} FILTER r.date >= ${startOfBeforeMonth} && r.date <= ${endOfBeforeMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) RETURN {currentStat, beforeStat}`

    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.status(200).send(result)
  }

});

router.post('/remove-perion', async (req, res, next) => {
  const { start_date, end_date } = req.body;
  var startDate = moment.utc(start_date, "YYYY-MM-DD").startOf('day').toDate().getTime();
  var endDate = moment.utc(end_date, "YYYY-MM-DD").endOf('day').toDate().getTime();
  try {
    await db.query(`FOR doc IN brandclick_perion_stat_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} REMOVE doc IN brandclick_perion_stat_reports`);
    return res.status(200).send("ok");
  } catch (error) {
    console.log(error.response['body'])
    return res.status(500).send("error");
  }
});

module.exports = router;