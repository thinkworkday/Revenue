var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
var moment = require('moment');
const creds = require("../../../client_secret.json");
const { GoogleSpreadsheet } = require('google-spreadsheet');
var request = require('request');

router.use(auth);

router.post('/day-to-day', async (req, res, next) => {
    const { start_date, end_date } = req.body
    let cron_start_date = moment.utc(start_date).format("YYYY-MM-DD");
    let cron_end_date = moment.utc(end_date).format("YYYY-MM-DD");
    const doc = new GoogleSpreadsheet(process.env.CBSSPREADSHEETID);
    // access SpreadSheet
    await doc.useServiceAccountAuth({
        client_email: creds.client_email,
        private_key: creds.private_key,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    console.log(doc.title);

    const sheet = doc.sheetsByIndex[2]; // or use doc.sheetsById[id]
    var url = `http://bing-reports-v2.us-west-1.elasticbeanstalk.com/api/submitReport?key=sfe6420sf654ewt6f35x&reportType=TypeTag&startDate=${cron_start_date}&endDate=${cron_end_date}&granularity=Day&includeTypeTag=false`

    var options = {
        url: url,
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var bodyJson = JSON.parse(body);
            console.log("jobId", bodyJson.result["jobId"])
            var jobId = bodyJson.result["jobId"];
            //getAsyncJobReport
            getAsyncJobReport(jobId);
        } else {
            console.log("something wrong. please check")
        }
    });
    var getAsyncJobReport = function (jobId) {
        var url = `http://bing-reports-v2.us-west-1.elasticbeanstalk.com/api/getReport?jobId=${jobId}&format=json`;

        var options = {
            url: url,
        };
        var cbsBing = [];
        request(options, async function (error, response, body) {
            console.log("Retrying!", error, response.statusCode);
            if (!error && response.statusCode == 200) {
                var bodyJson = JSON.parse(body);
                var cbsData = bodyJson.results.split(/\r?\n/);
                for (var i = 5; i < cbsData.length - 3; i++) {
                    var subData = cbsData[i].split(',');
                    let stat = {};
                    stat = {
                        date: moment.utc(subData[0].replace(/"/gi, '')).format("YYYY-MM-DD"),
                        adUnitName: subData[1].replace(/"/gi, ''),
                        adUnitId: subData[2].replace(/"/gi, ''),
                        clicks: subData[3].replace(/"/gi, ''),
                        estimatedNetRevenue: subData[4].replace(/"/gi, ''),
                        impressions: subData[5].replace(/"/gi, ''),
                        nonBillableSRPVs: subData[6].replace(/"/gi, ''),
                        rawSRPVs: subData[7].replace(/"/gi, ''),
                        typeTag: subData[8].replace(/"/gi, ''),
                        market: subData[9].replace(/"/gi, ''),
                        deviceType: subData[10].replace(/"/gi, ''),
                    }
                    cbsBing.push(stat);
                }

                await sheet.addRows(cbsBing);
                return res.status(200).send({ stats: 'ok' });
            } else {
                setTimeout(() => {
                    getAsyncJobReport(jobId);
                }, 3000);

                console.log("AsyncJobReport Api is something wrong. Retrying!");
            }
        });
    }
})

module.exports = router;