var moment = require('moment');
var request = require('request');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require("../../../client_secret.json");
var axios = require('axios');

const doc = new GoogleSpreadsheet(process.env.CBSSPREADSHEETID);

async function cbsYahooCronJob() {
  var requestDate = moment.utc().subtract(1, "days").format("YYYYMMDD");
  console.log("*************CBS Yahoo Cron Job start!*************");
  var cbsYahooData = [];
  // access SpreadSheet
  await doc.useServiceAccountAuth({
    client_email: creds.client_email,
    private_key: creds.private_key,
  });
  await doc.loadInfo(); // loads document properties and worksheets
  // console.log(doc.title);

  const sheet = doc.sheetsByIndex[1]; // or use doc.sheetsById[id]
  // console.log(sheet.title);
  // console.log(sheet.rowCount);

  var config = {
    method: 'get',
    url: `https://adreport.cbsi.io/report/yahoo?reportType=getTypeDetailReport&rev=1&key=reg6501fsdg&startDate=${requestDate}&endDate=${requestDate}`,
    headers: {}
  };

  axios(config)
    .then(async function (response) {
      var respond_data = response.data.split(/\r?\n/);
      for (var i = 1; i < respond_data.length; i++) {
        var subData = respond_data[i].split(',');
        let stat = {}
        stat = {
          date: subData[0].replace(/"/gi, ''),
          market: subData[1].replace(/"/gi, ''),
          sourceTag: subData[2].replace(/"/gi, ''),
          deviceType: subData[3].replace(/"/gi, ''),
          typeTag: subData[4].replace(/"/gi, ''),
          searches: subData[5].replace(/"/gi, ''),
          biddedSearches: subData[6].replace(/"/gi, ''),
          biddedClicks: subData[7].replace(/"/gi, ''),
          estimatedNetRevenue: subData[8].replace(/"/gi, ''),
          coverage: subData[9].replace(/"/gi, ''),
          ctr: subData[10].replace(/"/gi, ''),
          tqScore: subData[11].replace(/"/gi, ''),
        }
        cbsYahooData.push(stat);

      }
      if (cbsYahooData.length > 0) {
        await sheet.addRows(cbsYahooData);
        console.log("CBS Yahoo Cron Job End!");
      }
      else {
        console.log("No Existed Stats.");
        setTimeout(function () {
          cbsYahooCronJob();
        }, 1000 * 60 * 60);
        console.log("CBS Yahoo Cron Job Retrying After 1 hour.");
      }

    })
    .catch(function (error) {
      console.log(error);
    });


}

module.exports = {
  cbsYahooCronJob,
}