var moment = require('moment');
const { db, Notifications } = require('../../../services/arango');
const aql = require('arangojs').aql;
var axios = require('axios');

function MonarchApptitudeCronJob() {
    var cron_date = moment().utc().subtract(2, "days").format("YYYY-MM-DD");
    console.log('************Monarch Apptitude Cron Job start!*************');
    var monarchApptitudeData = [];
    var body = {
        startDate: cron_date,
        endDate: cron_date,
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
        data : data
    };
      
    axios(config)
      .then(async function (response) {
        var respond_data = response.data.split(/\r?\n/);

        for (var i=1; i < respond_data.length; i++ ) {
            var subdata = respond_data[i].split(',');
            let stat = {}
            stat = {
                date: moment.utc(subdata[0], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000*60*60*10).toDate().getTime(),
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
        if (monarchApptitudeData.length > 0) {
            try {
                await db.query(aql`FOR stat IN ${monarchApptitudeData} UPSERT { date: stat.date, partner: stat.partner, subid: stat.subid, formcode: stat.formcode, country: stat.country, clicks: stat.clicks, websitecountry: stat.websitecountry, devicetype: stat.devicetype, revenue: stat.revenue } INSERT stat UPDATE stat IN monarch_apptitudes`);
            
            } catch(error) {
                console.log('Error Upsert Monarch Apptitude Stat: ' + error);
            }
        } else {
            await retryCronJob();
        }
        
        console.log('********* Monarch Apptitude Cron Job End! *********');
    })
    .catch(function (error) {
        console.log(error);
    });
}

// retry Cron Job
async function retryCronJob() {
    const createdAt = moment.utc().toDate().getTime();
    let title = `Apptitude Stats, Failed to Import. Trying again in 1 hour.`;
    const notification = await Notifications.insert({ title, content: title, createdAt }).one();
    const notificationId = notification._id;
    const sender = "system";
    await db.query(`FOR u IN users FILTER u.role == 1 INSERT { notificationId: "${notificationId}", sender: "${sender}", receiver: u._id, status: false, createdAt: ${createdAt}, show: "active" } INTO subnotifications RETURN NEW`);
    setTimeout(function () {
        MonarchApptitudeCronJob();
    }, 1000 * 60 * 60);
    console.log(title);
}

module.exports =  {
    MonarchApptitudeCronJob,
}