var moment = require('moment');
const { db } = require('../../../services/arango');

//Cron Job Apptitude Split Update function
async function apptitudeSplitUpdateCronJob() {
    var startDate = moment().utc().subtract(2, "days").startOf('day').toDate().getTime();
    var endDate = moment().utc().subtract(2, 'days').endOf('day').toDate().getTime();
    console.log('Apptitude Split Update Cron Job start!');
    try {
        await db.query(`FOR stat IN monarch_apptitudes FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'apptitude' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN monarch_apptitudes`)
    } catch (error) {
        console.log(error);
    }

    console.log('Apptitude Split Update Cron Job End!');
}

module.exports = {
    apptitudeSplitUpdateCronJob,
}