var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const verizonFunctions = require('../helpers/verizon-scraper')
var moment = require('moment');
const { db, Companies } = require('../../../services/arango');
const aql = require('arangojs').aql;
var request = require('request');
var jwt = require('jsonwebtoken');
var https = require('https');
var fs = require('fs');
const { unzip } = require('zip-unzip-promise');

router.use(auth);

//get all Verizon stats
router.get('/', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await verizonFunctions.getVerizonStat(company, startDate, endDate);
    if (stats) {
      res.status(200).send({ stats: stats });
    }
});

//get all Verizon stats
router.get('/all-publishers', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await verizonFunctions.getPublisherVerizonStat(company, startDate, endDate);
    if (stats) {
      res.status(200).send({ stats: stats })
    }
});

//Gets summary row for perion stats
router.get('/chart_metrics', async (req, res, next) => {
    console.log('Chart Verizon Metrics')
    const { company, startDate, endDate } = req.query;
    let chartSummary = await verizonFunctions.getChartMetrics(company, startDate, endDate);
    if (chartSummary) {
      res.status(200).send({ revenuePerDay: chartSummary.revenuePerDay, publisherRevenuePerDay: chartSummary.publisherRevenuePerDay, datesOfRevenue: chartSummary.datesOfRevenue, searchesPerDay: chartSummary.searchesPerDay })
    }
});

//Gets summary row for Verizon stats
router.get('/summary_metrics', async (req, res, next) => {
    console.log('Summary Metrics Route')
    console.log(req.query)
    const { company, startDate, endDate } = req.query;
    let summary = await verizonFunctions.getSummaryMetrics(company, startDate, endDate);
    if (summary) {
      res.status(200).send({ summary });
    }
});

//get dashboard show Verizon
router.get("/all-stat", async (req, res, next) => {
    //Gets the starting day of the month UTC MS Timestamp
    let startOfCurrentMonth = moment().utc().subtract(30, 'days').startOf('day').toDate().getTime();
    //Gets the end of month day of the month UTC MS Timestamp
    let endOfCurrentMonth = moment().utc().endOf('day').toDate().getTime();
    let startOfBeforeMonth = moment().utc().subtract(60, 'days').startOf('day').toDate().getTime();
    let endOfBeforeMonth = moment().utc().subtract(30, 'days').endOf('day').toDate().getTime();
  
    let aql = `LET currentStat = (FOR r IN verizon_direct_reports FILTER r.date >= ${startOfCurrentMonth} && r.date <= ${endOfCurrentMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) LET beforeStat = (FOR r IN verizon_direct_reports FILTER r.date >= ${startOfBeforeMonth} && r.date <= ${endOfBeforeMonth} COLLECT date = r.date AGGREGATE revenue = SUM(TO_NUMBER(r.revenue)) RETURN {date, revenue }) RETURN {currentStat, beforeStat}`
    
    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.status(200).send(result)
});

//manual add verizon
router.post('/day-by-day', async (req, res, next) => {
    const { request_start_date, request_end_date } = req.body
    let requestStartDate = moment.utc(request_start_date).format("YYYYMMDD");
    let requestEndDate = moment.utc(request_end_date).format("YYYYMMDD");
    var b2bHost = "id.b2b.yahooinc.com"
    var accessTokenURL = "https://" + b2bHost + "/identity/oauth2/access_token";
    var grantType = "client_credentials";
    var scope = "pi-api-access";
    var realm = "pi";
    var clientAssertionType = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
    var clientId = process.env.PARTNER_INSIGHTS_CLIENT_ID; //Fill your client id
    var clientSecret = process.env.PARTNER_INSIGHTS_CLIENT_SECRET; //Fill your client secret 

    var generateJWT = function() {
        var token = jwt.sign({ 
            "aud": "https://" + b2bHost + "/identity/oauth2/access_token?realm=" + realm,
            "iss": clientId,
            "sub": clientId,
            "exp": Math.floor(Date.now() / 1000) + (10 * 60),
            "iat": Math.floor(Date.now() / 1000)
        }, clientSecret);
      
        return token;
    }

    var getAccessToken = function(callback) {
        request.post(accessTokenURL, {
            form: {
                "grant_type": grantType,
                "client_assertion_type": clientAssertionType,
                "realm": realm,
                "scope": scope,
                "client_assertion": generateJWT()
            }
        }, function optionalCallback(error, response, body){
            if (!error && response.statusCode == 200) {
                var bodyJson = JSON.parse(body);
                console.log(bodyJson.access_token);
                callback(bodyJson.access_token);
            } else {
                console.log("something wrong. please check", error)
            }
            
        });
    
    }
    var invokeGetDataAvailablity = function(accessToken) {
        var url = `https://api-partnerinsights.yahoo.com/PartnerAnalytics/service/ReportsAPI/getDataAvailability?reportType=Source&format=json&rollup=Daily&startDate=${requestStartDate}&endDate=${requestEndDate}`;
        var options = {
          url: url,
          strictSSL: false,
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        };
        request(options, function(error, response, body){
          if (!error && response.statusCode == 200) {
            getReportDetail(accessToken);
          } else {
            console.log("something wrong. please check")
          }
        });
    };

    var getReportDetail = function(accessToken) {
        var url = `https://api-partnerinsights.yahoo.com/PartnerAnalytics/service/ReportsAPI/getTypeDetailReport?userId=haydenm_brandclick_pi&startDate=${requestStartDate}&endDate=${requestEndDate}&attributeList=user+country%2Csource+tag%2C+type+tag&mrkt_id=ALL&product=ALL&channel=&currency=0&sourceTag=%2A&orderBy=DATA+DATE&sortOrder=&startRow=1&returnRows=10000&dateRollup=Daily&dateRange=CUSTOM&type=ASYNC&label=&partnerList=brand&format=json&appVer=307&scheduleFrequency=1&scheStartDate=${requestStartDate}&scheEndDate=${requestEndDate}&rv=0&device=ALL`;
        var options = {
          url: url,
          strictSSL: false,
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        };
        request(options, function(error, response, body){
            if (!error && response.statusCode == 200) {
                var bodyJson = JSON.parse(body);
                var jobId = bodyJson.ResultSet.Row.ID;
                console.log("============bodyJson============", bodyJson)
                if (bodyJson.MetaInfo && bodyJson.MetaInfo.ResponseStatus == 'SUCCESS') {
                    getAsyncJobStatus(accessToken, jobId);
                } else {
                    console.log("ReportDetail Api is something wrong. please check")
                }
              
            } else {
              console.log("something wrong. please check")
            }
        });
    }

    var getAsyncJobStatus = function(accessToken, jobId) {
        var url = `https://api-partnerinsights.yahoo.com/PartnerAnalytics/service/ReportsAPI/getAsyncJobStatus?asyncJobId=${jobId}&fileFormat=json&format=json`;
        var options = {
            url: url,
            strictSSL: false,
            headers: {
              'Authorization': 'Bearer ' + accessToken
            }
        };
        request(options, function(error, response, body){
            if (!error && response.statusCode == 200) {
                var bodyJson = JSON.parse(body);
                console.log("==========bodyJson=========",bodyJson)
                if (bodyJson.MetaInfo && bodyJson.MetaInfo.ResponseStatus == 'SUCCESS' && bodyJson.ResultSet.Row.REPORT_STATUS == 'Completed') {
                    reportDownload(bodyJson.ResultSet.Row.REPORT_OUTPUT_FILE, accessToken);
                } else {
                    setTimeout(() => {
                        getAsyncJobStatus(accessToken, jobId);
                    }, 5000)
                    
                    console.log("AsyncJobStatus Api is something wrong. Retrying!")
                }
            } else {
                console.log("something wrong. please check")
            }
        });
    }

    getAccessToken(invokeGetDataAvailablity);
});

function reportDownload(fileUrl, accessToken) {
    var options = {
        hostname: `partnerinsights.yahoo.com`,
        path: '/?' + fileUrl.split('/?')[fileUrl.split('/?').length - 1],
        strictSSL: false,
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
    };
    var fileNameArr = fileUrl.split('/');
    var fileName = fileNameArr[fileNameArr.length - 1];
    var filePath = './media/partner-insight/' + fileName;
    
    https.get(options, (res) => {
        if (res.statusCode == 200) {
            // Open file in local filesystem
            const file = fs.createWriteStream(filePath);
            // Write data into local file
            res.pipe(file);
        
            // Close the file
            file.on('finish', async () => {
                file.close();
                console.log(`File downloaded!`);
                await fileUnzip(filePath, fileName);
            });
          
        } else {
          console.log("something wrong. please check")
        }
    }).on("error", (err) => {
        console.log("Error: ", err.message);
    });

}

//unzip file and read json
async function fileUnzip(filePath, name) {
    await unzip(filePath, './media/partner-insight/');
    
    var statName = name.split('.').slice(0,2).join('.');
    getPartnerStat(statName);

}

//read json
function getPartnerStat(statName) {
    fs.readFile('./media/partner-insight/' + statName, 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        var verizonData = obj.ResultSet.Row;

        saveVerizonStat(verizonData);
    });
}

//save the data to verizon
function saveVerizonStat(verizonData) {
    var verizonList = [];
    if(verizonData.length > 0) {
        for(var verizon of verizonData) {
            var verizonStat = {
                date: moment.utc(verizon.DATA_DATE, "YYYYMMDD").startOf('day').toDate().getTime() + moment.utc(1000*60*60*10).toDate().getTime(),
                sourceTag: verizon.SOURCE_TAG,
                userCountry: verizon.USER_COUNTRY,
                subid: verizon.TYPE_TAG,
                searches: verizon.SEARCHES,
                biddedSearches: verizon.BIDDED_SEARCHES,
                biddedResults: verizon.BIDDED_RESULTS,
                biddedClicks: verizon.BIDDED_CLICKS,
                revenue: verizon.ESTIMATED_GROSS_REVENUE,
                coverage: verizon.COVERAGE,
                ctr: verizon.CTR,
                cpc: verizon.PPC,
                tqScore: verizon.TQ_SCORE,
                rn: verizon.RN,
                split: 0
            }
            verizonList.push(verizonStat)
        }
    }
    try {
        db.query(aql`FOR doc IN ${verizonList} INSERT doc INTO verizon_direct_reports`);
    } catch (error) {
        console.log(error)
    }
    console.log("Verizon Direct Cron Job End!");
}

module.exports = router;
