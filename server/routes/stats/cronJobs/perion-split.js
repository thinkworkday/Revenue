var moment = require('moment');
const { db } = require('../../../services/arango');

//Cron Job Perion Split Update function
async function perionSplitUpdateCronJob() {
    var startDate = moment().utc().subtract(2, "days").startOf('day').toDate().getTime();
    var endDate = moment().utc().subtract(2, 'days').endOf('day').toDate().getTime();
    console.log('Perion Split Update Cron Job start!');
    let aql = `FOR com IN companies FOR r IN com.reportingProviders FILTER r.reportingProvider == "perion" RETURN com`;
    const cursor = await db.query(aql);
    let companyInfo = await cursor.all();
    
    if(companyInfo) {
        for (var companyData of companyInfo) {
            var company_name = companyData.name.trim().split(" ").map(function(e){return e.trim().toLowerCase();});
            var company_id = companyData._id;
            var perionStatCollectionName = `${company_name.join("")}_perion_stat_reports`;
            try {
                await db.query(`FOR stat IN ${perionStatCollectionName} FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'perion' && t.company == "${company_id}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(TO_STRING(stat.subid), ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(TO_STRING(stat.subid), ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(TO_STRING(stat.subid), ts.subid)) || (ts.filterTag == 'ExactValue' && TO_STRING(stat.subid) == ts.subid) UPDATE stat WITH {"split": ts.split} IN ${perionStatCollectionName}`)
            } catch (error) {
                console.log(error);
            }
        }
        console.log('Perion Split Update Cron Job End!');
    }
}

module.exports =  {
    perionSplitUpdateCronJob,
}