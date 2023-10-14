var moment = require('moment');
const { db, Notifications } = require('../../../services/arango');
const aql = require('arangojs').aql;
var axios = require('axios');
const { XMLParser } = require("fast-xml-parser");

function hopkinYHSStatCronJob() {
    var cronDate = moment().utc().subtract(1, "days").format("YYYY-MM-DD");
    console.log("************** Hopkins YHS Cron Job start! ***************")
    var config = {
        method: 'get',
        url: `https://adserver.onevent.io/xml/report?key=X9LxVG87xEpPABT2Y&date=${cronDate}`,
        headers: {}
    };

    axios(config)
        .then(async function (response) {
            var hopkinData = [];
            const parser = new XMLParser();
            let jObj = parser.parse(response.data);
            let resData = jObj['yStats-Type'];
            var stat;
            if (resData.row) {
                try {
                    for (var subData of resData.row) {
                        stat = {
                            date: moment.utc(subData.ReportDate, "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                            market: subData.Market,
                            currency: subData.Currency,
                            device: subData.Device,
                            subid: subData.TypeTag,
                            searches: subData.Searches,
                            biddedSearches: subData.BiddedSearches,
                            biddedClicks: subData.BiddedClicks,
                            revenue: subData.NetGross,
                            coverage: subData.Coverage,
                            ppc: subData.PPC,
                            tq: subData.TQ,
                            sourceTQ: subData.SourceTQ,
                            split: 0
                        }
                        hopkinData.push(stat);
                    }
                } catch (error) {
                    stat = {
                        date: moment.utc(resData.row.ReportDate, "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                        market: resData.row.Market,
                        currency: resData.row.Currency,
                        device: resData.row.Device,
                        subid: resData.row.TypeTag,
                        searches: resData.row.Searches,
                        biddedSearches: resData.row.BiddedSearches,
                        biddedClicks: resData.row.BiddedClicks,
                        revenue: resData.row.NetGross,
                        coverage: resData.row.Coverage,
                        ppc: resData.row.PPC,
                        tq: resData.row.TQ,
                        sourceTQ: resData.row.SourceTQ,
                        split: 0
                    }
                    hopkinData.push(stat);
                }
                if (hopkinData.length > 0) {
                    try {
                        await db.query(aql`FOR doc IN ${hopkinData} INSERT doc INTO hopkin_stat_reports`);
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    await retryCronJob();
                }
            } else {
                console.log(" ****** Not Existed Data! ******")
            }

            console.log(" ********** Hopkins YHS Cron Job End! ********** ")
        })
        .catch(function (error) {
            console.log(error);
        });
}

// retry Cron Job
async function retryCronJob() {
    const createdAt = moment.utc().toDate().getTime();
    let title = `Hopkin YHS Stats, Failed to Import. Trying again in 1 hour.`;
    const notification = await Notifications.insert({ title, content: title, createdAt }).one();
    const notificationId = notification._id;
    const sender = "system";
    await db.query(`FOR u IN users FILTER u.role == 1 INSERT { notificationId: "${notificationId}", sender: "${sender}", receiver: u._id, status: false, createdAt: ${createdAt}, show: "active" } INTO subnotifications RETURN NEW`);
    setTimeout(function () {
        hopkinYHSStatCronJob();
    }, 1000 * 60 * 60);
    console.log(title);
}

module.exports = {
    hopkinYHSStatCronJob,
}