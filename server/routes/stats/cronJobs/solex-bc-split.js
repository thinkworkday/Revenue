var moment = require('moment');
const { db } = require('../../../services/arango');

//Cron Job Solex BC Split Update function 
async function solexbcSplitUpdateCronJob() {
    var startDate = moment().utc().subtract(2, "days").startOf('day').toDate().getTime();
    var endDate = moment().utc().subtract(2, 'days').endOf('day').toDate().getTime();
    console.log('Solex BC Split Update Cron Job start!');
    try {
        await db.query(`FOR stat IN solexbc_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'solex-bc' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN solexbc_stat_reports`)
    } catch (error) {
        console.log(error);
    }
    console.log('Solex BC Split Update Cron Job End!');
}

module.exports =  {
    solexbcSplitUpdateCronJob,
}