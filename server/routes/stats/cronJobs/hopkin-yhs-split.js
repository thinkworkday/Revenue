var moment = require('moment');
const { db } = require('../../../services/arango');

//Cron Job Hopkins YHS Split Update function 
async function hopkinSplitUpdateCronJob() {
    var startDate = moment().utc().subtract(1, "days").startOf('day').toDate().getTime();
    var endDate = moment().utc().subtract(1, 'days').endOf('day').toDate().getTime();
    console.log('Hopkins YHS Split Update Cron Job start!');
    try {
        await db.query(`FOR stat IN hopkin_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'hopkins' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN hopkin_stat_reports`)
    } catch (error) {
        console.log(error);
    }
    console.log('Hopkins YHS Split Update Cron Job End!');
}

module.exports = {
    hopkinSplitUpdateCronJob,
}