var moment = require('moment');
const { db, Notifications } = require('../../../services/arango');
const request = require('request');
const aql = require('arangojs').aql;
var axios = require('axios');

async function solexBCStatCronJob() {
    var cron_date = moment().utc().subtract(2, "days").format("YYYY-MM-DD");
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
    for(var solexBase of solexBaseData) {

        axiosArray.push(axios({
            method: 'get',
            url: `https://r.a9g.io/r/v1?s=${solexBase.tagId}&k=${solexBase.secret}&start=${cron_date}&end=${cron_date}`,
            headers: { }
        }))
    }
    console.log("*********** SolexBC Cron Job start! ************");
    try {
        const resData = await axios.all(axiosArray);
        for (var res of resData) {
            for (var i=1; i < res.data.split(/\r\n|\n/).length - 1; i++ ) {
                var subData = res.data.split(/\r\n|\n/)[i].split(',');
                let stat = {};
                stat = {
                    date: moment.utc(subData[0].replace('"', ''), "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000*60*60*10).toDate().getTime(),
                    subid: subData[1].replace('"', '').replace('\"', ''),
                    country: subData[2].replace('"', '').replace('\"', ''),
                    searches: subData[3].replace('"', ''),
                    searchesPaid: subData[4].replace('"', ''),
                    clicks: subData[6].replace('"', ''),
                    revenue:subData[7].replace('"', ''),
                    split: 0
                }
                solexBCData.push(stat);
            }
        }
        if (solexBCData.length > 0) {
            try {
                await db.query(aql`FOR doc IN ${solexBCData} UPSERT { date: doc.date, subid: doc.subid, country: doc.country } INSERT doc UPDATE { date: doc.date, subid: doc.subid, country: doc.country, searches: doc.searches,searchesPaid: doc.searchesPaid, clicks: doc.clicks, revenue: doc.revenue } IN solexbc_stat_reports`);
            } catch (error) {
                console.log(error);
            }
        } else {
            await retryCronJob();
        }
                
        
    } catch (error) {
        // console.log(error);
        await retryCronJob();
    }
    
    console.log("Solex BC Cron Job End!");
}

// retry Cron Job
async function retryCronJob() {
    const createdAt = moment.utc().toDate().getTime();
    let title = `SolexBC Stats, Failed to Import. Trying again in 1 hour.`;
    const notification = await Notifications.insert({ title, content: title, createdAt }).one();
    const notificationId = notification._id;
    const sender = "system";
    await db.query(`FOR u IN users FILTER u.role == 1 INSERT { notificationId: "${notificationId}", sender: "${sender}", receiver: u._id, status: false, createdAt: ${createdAt}, show: "active" } INTO subnotifications RETURN NEW`);
    setTimeout(function () {
        solexBCStatCronJob();
    }, 1000 * 60 * 60);
    console.log(title);
}

module.exports =  {
    solexBCStatCronJob,
}