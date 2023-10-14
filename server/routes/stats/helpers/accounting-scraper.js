const moment = require('moment');
const { db, Companies } = require('../../../services/arango')
const aql = require('arangojs').aql;
const helperFunctions = require('./date-formatter');

//Get Rubi Stat
async function getRubiStats(company, start, end) {
    startDate = moment.utc(start, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(end, "MM-DD-YYYY").endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN rubi_stat_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'rubi' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), split = AVERAGE(TO_NUMBER(doc.split)) SORT subid DESC RETURN { subid, revenue, split }`)
                .then(cursor => {
                    return cursor.map(ru => {
                        return ru;
                    })

                })
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    console.log('Inner catch error...')
                    console.log(err);
                    reject(err);
                })
        } catch (error) {
            console.log(error)
        }
    })
}

//Gets Perion Stats
async function getPerionStats(company, startDate, endDate) {
    startDate = moment.utc(startDate, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(endDate, "MM-DD-YYYY").endOf('day').toDate().getTime();
    let companyInfo = await Companies.find().where({ _id: company }).one().limit(1);
    if (companyInfo) {
        var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
        var companyid = companyInfo._id;
        var perionCollectionName = (`${company_name.join("")}_perion_stat_reports`).toString()
        console.log("*********** get stat ***********", perionCollectionName)
        for (var reportingProvider of companyInfo.reportingProviders) {
            if (reportingProvider.reportingProvider == "perion") {
                return new Promise((resolve, reject) => {
                    try {
                        db.query(`
                            FOR doc in ${perionCollectionName}
                                FILTER doc.date >= ${startDate} && doc.date <= ${endDate} && doc.company_id == "${companyid}" FOR t IN tags FILTER t.advertiser == 'perion' && t.company == "${companyid}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid)
                                COLLECT subid = doc.subid
                                AGGREGATE revenue = SUM(ABS(doc.revenue)), split = AVERAGE(TO_NUMBER(doc.split))
                                SORT subid DESC
                                RETURN { subid, revenue, split }
                        `)
                            .then(cursor => {
                                return cursor.map(t => {
                                    // console.log(t)
                                    return t;
                                })
                            })
                            .then(keys => {
                                // console.log('keys')
                                resolve(keys);
                            })
                            .catch(err => {
                                console.log('Inner catch error...')
                                console.log(err);
                                reject(err);
                            })
                    } catch (err) {
                        console.log(err)
                    }
                })
            }
        }


    } else {
        return;
    }

}

//Get Lyons Stat
async function getLyonsStats(company, start, end) {
    startDate = moment.utc(start, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(end, "MM-DD-YYYY").endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN lyon_stat_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'lyons' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), split = AVERAGE(TO_NUMBER(doc.split))
            SORT subid DESC
            RETURN { subid, revenue, split }`)
                .then(cursor => {
                    return cursor.map(ru => {
                        return ru;
                    })

                })
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    console.log('Inner catch error...')
                    console.log(err);
                    reject(err);
                })
        } catch (error) {
            console.log(error)
        }
    })
}

//Get Apptitude Stat
async function getApptitudeStats(company, start, end) {
    startDate = moment.utc(start, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(end, "MM-DD-YYYY").endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN monarch_apptitudes FILTER doc.date >= ${startDate} && doc.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'apptitude' && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || (ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%')) || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), split = AVERAGE(TO_NUMBER(doc.split)) SORT subid DESC RETURN { subid, revenue, split }`)
                .then(cursor => {
                    return cursor.map(ru => {
                        return ru;
                    })

                })
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    console.log('Inner catch error...')
                    console.log(err);
                    reject(err);
                })
        } catch (error) {
            console.log(error)
        }
    })
}

//Get Solexbc Stat
async function getSolexBCStats(company, start, end) {
    startDate = moment.utc(start, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(end, "MM-DD-YYYY").endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN solexbc_stat_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'solex-bc' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || (ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%')) || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), split = AVERAGE(TO_NUMBER(doc.split)) SORT subid DESC RETURN { subid, revenue, split }`)
                .then(cursor => {
                    return cursor.map(ru => {
                        return ru;
                    })

                })
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    console.log('Inner catch error...')
                    console.log(err);
                    reject(err);
                })
        } catch (error) {
            console.log(error)
        }
    })
}

//Get Verizon Stat
async function getVerizonDirectStats(company, start, end) {
    startDate = moment.utc(start, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(end, "MM-DD-YYYY").endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN verizon_direct_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'verizon-direct' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || (ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%')) || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), split = AVERAGE(TO_NUMBER(doc.split)) SORT subid DESC RETURN { subid, revenue, split }`)
                .then(cursor => {
                    return cursor.map(ru => {
                        return ru;
                    })

                })
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    console.log('Inner catch error...')
                    console.log(err);
                    reject(err);
                })
        } catch (error) {
            console.log(error)
        }
    })
}

//Get System1 Stat
async function getSystem1Stats(company, start, end) {
    startDate = moment.utc(start, "MM-DD-YYYY").startOf('day').toDate().getTime();
    endDate = moment.utc(end, "MM-DD-YYYY").endOf('day').toDate().getTime();

    return new Promise((resolve, reject) => {
        try {
            db.query(`FOR doc IN system1_stat_reports FILTER doc.date >= ${startDate} && doc.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'verizon-direct' FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || (ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%')) || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), split = AVERAGE(TO_NUMBER(doc.split)) SORT subid DESC RETURN { subid, revenue, split }`)
                .then(cursor => {
                    return cursor.map(ru => {
                        return ru;
                    })

                })
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    console.log('Inner catch error...')
                    console.log(err);
                    reject(err);
                })
        } catch (error) {
            console.log(error)
        }
    })
}


module.exports = {
    getRubiStats,
    getPerionStats,
    getLyonsStats,
    getApptitudeStats,
    getSolexBCStats,
    getVerizonDirectStats,
    getSystem1Stats,
};