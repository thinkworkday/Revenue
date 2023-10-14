var moment = require('moment');
const { db, Notifications } = require('../../../services/arango');
const aql = require('arangojs').aql;
var axios = require('axios');

function system1StatCronJob() {
    var cronDate = moment().utc().subtract(3, "days").format("YYYY-MM-DD");
    console.log("************ System1 Cron Job start! ************")
    var config = {
        method: 'GET',
        url: `https://reports.system1.com/v3/ptag?auth_key=lucdJjxo2qqkeerBY0Oh&days=${cronDate}&format=json`,
        headers: { }
    };
    axios(config)
        .then(async function (response) {
            var resData = response.data;
            var system1Data = [];
            for (var i=1; i < resData.length -1; i++) {
                var stat = {
                    date: moment.utc(resData[i][0], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000*60*60*10).toDate().getTime(),
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
                await db.query(aql`FOR doc IN ${system1Data} INSERT doc INTO system1_stat_reports`);
            } catch (error) {
                await retryCronJob();
                console.log(error);
            }
            console.log("System1 Cron Job End!");
        })
        .catch(async function (error) {
            await retryCronJob();
            console.log(error);
        });
}

// retry Cron Job
async function retryCronJob() {
    const createdAt = moment.utc().toDate().getTime();
    let title = `System1 Stats, Failed to Import. Trying again in 1 hour.`;
    const notification = await Notifications.insert({ title, content: title, createdAt }).one();
    const notificationId = notification._id;
    const sender = "system";
    await db.query(`FOR u IN users FILTER u.role == 1 INSERT { notificationId: "${notificationId}", sender: "${sender}", receiver: u._id, status: false, createdAt: ${createdAt}, show: "active" } INTO subnotifications RETURN NEW`);
    setTimeout(function () {
        system1StatCronJob();
    }, 1000 * 60 * 60);
    console.log(title);
}

module.exports =  {
    system1StatCronJob,
}