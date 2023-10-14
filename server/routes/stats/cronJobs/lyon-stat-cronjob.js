var moment = require('moment');
var axios = require('axios');
const { db, Notifications } = require('../../../services/arango');
const aql = require('arangojs').aql;

//Cron Job Lyon function
function lyonStatCronJob() {
    var cron_date = moment().utc().subtract(1, "days").format("YYYY-MM-DD");
    let lyonData = [];
    console.log('Lyons Cron Job start!');
    var config = {
        method: 'get',
        url: `http://rt.api.imageadvantage.net/PublisherAPIReports/?StartDate=${cron_date}&EndDate=${cron_date}&Key=8r4nd(1!(k494!&ReportType=0`,
        headers: { }
    };
    axios(config)
    .then(async function (response) {
        var respond_data = response.data.split(/\r?\n/);
        for (var i=1; i < respond_data.length -1; i++ ) {
            var subdata = respond_data[i].split(',');
            let stat = {}
            stat = {
                date: moment.utc(subdata[0], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000*60*60*10).toDate().getTime(),
                ma: subdata[1],
                subid: subdata[2] + "_" + subdata[3],
                searches: subdata[4],
                biddedSearches: subdata[5],
                clicks: subdata[6],
                biddedCTR: subdata[7],
                ctr: subdata[8],
                split: 0,
                revenue:subdata[9],
                tqScore:subdata[10],
            }        
            lyonData.push(stat);  
        }
        if (lyonData.length > 0) {
            try {
                await db.query(aql`FOR stat IN ${lyonData} INSERT stat INTO lyon_stat_reports`);
            
            } catch(error) {
                console.log('Error Upsert Lyon Stat: ' + error)
            }
        } else {
            await retryCronJob();
        }
        console.log('Lyons Cron Job End!');
    })
    .catch(function (error) {
        console.log(error);
    });  
}

// retry Cron Job
async function retryCronJob() {
    const createdAt = moment.utc().toDate().getTime();
    let title = `Lyons Stats, Failed to Import. Trying again in 1 hour.`;
    const notification = await Notifications.insert({ title, content: title, createdAt }).one();
    const notificationId = notification._id;
    const sender = "system";
    await db.query(`FOR u IN users FILTER u.role == 1 INSERT { notificationId: "${notificationId}", sender: "${sender}", receiver: u._id, status: false, createdAt: ${createdAt}, show: "active" } INTO subnotifications RETURN NEW`);
    setTimeout(function () {
        lyonStatCronJob();
    }, 1000 * 60 * 60);
    console.log(title);
}

module.exports =  {
    lyonStatCronJob,
}