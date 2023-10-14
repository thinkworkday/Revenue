var moment = require('moment');
const { db } = require('../../../services/arango');

//Cron Job Verizon Direct Split Update function
async function VerizonSplitUpdateCronJob() {
    var startDate = moment().utc().subtract(1, "days").startOf('day').toDate().getTime();
    var endDate = moment().utc().subtract(1, 'days').endOf('day').toDate().getTime();
    console.log('Verizon Split Update Cron Job start!');
    try {
        await db.query(`FOR doc IN verizon_direct_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'verizon-direct' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) UPDATE doc WITH {"split": ts.split} IN verizon_direct_reports`)
    } catch (error) {
        console.log(error);
    }

    console.log('Verizon Split Update Cron Job End!');
}

module.exports = {
    VerizonSplitUpdateCronJob,
}