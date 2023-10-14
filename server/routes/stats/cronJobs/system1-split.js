var moment = require('moment');
const { db } = require('../../../services/arango');

//Cron Job System1 Split Update function 
async function system1SplitUpdateCronJob() {
    var startDate = moment().utc().subtract(3, "days").startOf('day').toDate().getTime();
    var endDate = moment().utc().subtract(3, 'days').endOf('day').toDate().getTime();
    console.log('System1 Split Update Cron Job start!');
    try {
        await db.query(`FOR stat IN system1_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'system1' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN system1_stat_reports`)
    } catch (error) {
        console.log(error);
    }
    console.log('System1 Split Update Cron Job End!');
}

module.exports =  {
    system1SplitUpdateCronJob,
}