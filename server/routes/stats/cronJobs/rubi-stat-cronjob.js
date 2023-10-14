var moment = require('moment');
const { db, Notifications } = require('../../../services/arango');
const aql = require('arangojs').aql;
var axios = require('axios');

function rubiStatCronJob() {
    var cron_date = moment().utc().subtract(2, "days").format("YYYY-MM-DD");
    console.log("************** Rubi Cron Job start! ***************")
    var config = {
        method: 'get',
        url: `https://publisher.aka-api.com/api/publisher/reports?apiKey=b8ccd84e-345b-4196-b09b-c60e4c2ab1a9&format=json&fromDate=${cron_date}&toDate=${cron_date}`,
        headers: { }
    };
    axios(config)
        .then(async function (response) {
            var rubiData = [];
            
            for (var res_data of response.data) {
                if(res_data.rows.length > 0) {
                    for (var subData of res_data.rows) {
                        var stat = {
                            date: moment.utc(subData.Date, "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000*60*60*10).toDate().getTime(),
                            publisher: subData.Publisher,
                            subid: subData.SubID,
                            geo: subData.GEO,
                            total_searches: subData['Total Searches'],
                            monetized_searches: subData['MonetizedSearches'],
                            clicks: subData.Clicks,
                            revenue: subData["Net Revenue"],
                            split: 0
                        }
                        rubiData.push(stat);
                    }
                }
            }
            if (rubiData.length > 0) {
                try {
                    await db.query(aql`FOR doc IN ${rubiData} INSERT doc INTO rubi_stat_reports`);
                } catch (error) {
                    console.log(error)
                }
            } else {
                await retryCronJob();
            }
            console.log("Rubi Cron Job End!")  
        })
        .catch(function (error) {
            console.log(error);
        });
}

// retry Cron Job
async function retryCronJob() {
    const createdAt = moment.utc().toDate().getTime();
    let title = `Rubi Stats, Failed to Import. Trying again in 1 hour.`;
    const notification = await Notifications.insert({ title, content: title, createdAt }).one();
    const notificationId = notification._id;
    const sender = "system";
    await db.query(`FOR u IN users FILTER u.role == 1 INSERT { notificationId: "${notificationId}", sender: "${sender}", receiver: u._id, status: false, createdAt: ${createdAt}, show: "active" } INTO subnotifications RETURN NEW`);
    setTimeout(function () {
        rubiStatCronJob();
    }, 1000 * 60 * 60);
    console.log(title);
}

module.exports =  {
    rubiStatCronJob,
}