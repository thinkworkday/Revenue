var moment = require('moment');
const { db, Notifications } = require('../../../services/arango');
const request = require('request');
const aql = require('arangojs').aql;

//Cron Job a2o Perion function
async function a2oPerionStatCronJob() {
    console.log('A2O Perion Cron Job start!');
    var startDate = moment().utc().subtract(2, "days").format("YYYY-MM-DD");
    var endDate = moment().utc().subtract(2, "days").format("YYYY-MM-DD");

    //GET Perion Data From Company
    let companyAql = `FOR company in companies FILTER company.name == "A2O Media" FOR provider IN company.reportingProviders FILTER provider.reportingProvider == "perion" RETURN company`
    try {
        const companyCursor = await db.query(companyAql);
        let companyInformation = await companyCursor.all();
        for (var companyStat of companyInformation) {
            var companyName = companyStat.name;
            for (var companyReportingProvider of companyStat.reportingProviders) {
                if (companyReportingProvider.reportingProvider == "perion") {
                    let accessTokenStatus = await getAccessToken();
                    let perionData = [];
                    if (accessTokenStatus) {
                        let token = JSON.parse(accessTokenStatus).access_token;
                        var options = {
                            'method': 'GET',
                            'url': `https://api.codefuel.com/api/performance-data?provider=Bing&start_date=${startDate}&end_date=${endDate}&breakdowns=all&metrics=all&country_codes=all&products=all&channels=all&wallets=all&format=json`,
                            'headers': {
                                'Authorization': `Bearer ${token}`
                            }
                        };
                        request(options, async function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                for (var rowData of JSON.parse(response.body)) {
                                    let stat = {};

                                    stat = {
                                        company_id: `companies/${companyStat._key}`,
                                        date: moment.utc(rowData['date'], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                                        country_code: rowData['country_code'],
                                        country_name: rowData['country_name'],
                                        provider: rowData['provider'],
                                        subid: rowData['channel'],
                                        product: rowData['product'],
                                        wallet: rowData['wallet'],
                                        revenue: rowData['revenue'],
                                        monetized_searches: rowData['monetized_searches'],
                                        total_searches: rowData['total_searches'],
                                        ad_clicks: rowData['ad_clicks'],
                                        cf_initial_searches: rowData['cf_initial_searches'],
                                        bing_initial_searches: rowData['bing_initial_searches'],
                                        ad_impressions: rowData['ad_impressions'],
                                        bing_follow_on_searches: rowData['bing_follow_on_searches'],
                                        cpc: rowData['cpc'],
                                        ctr: rowData['ctr'],
                                        coverage_cf: rowData['coverage_cf'],
                                        coverage_bing: rowData['coverage_bing'],
                                        follow_on_searches_percentage: rowData['follow_on_searches_percentage'],
                                        initial_searches_diff: rowData['initial_searches_diff'],
                                        initial_searches_rpm: rowData['initial_searches_rpm'],
                                        split: 0
                                    }
                                    perionData.push(stat);
                                }
                                if (perionData.length > 0) {
                                    let processData = JSON.stringify(perionData);
                                    let nameChange = companyName.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
                                    let perionCollectionName = (`${nameChange.join("")}_perion_stat_reports`).toString();
                                    try {
                                        await db.query(`FOR doc IN ${processData} INSERT doc INTO ${perionCollectionName}`);
                                    } catch (error) {
                                        console.log(error);
                                    }
                                } else {
                                    await retryCronJob(companyName);
                                }
                            } else {
                                console.log(error);
                                await retryCronJob(companyName);
                            }
                        });
                    }

                }

            }
        }
    } catch (error) {
        console.log('Error: ' + error);
    }
    console.log('A2O Perion Cron Job End!');
}

// retry Cron Job
async function retryCronJob(companyName) {
    const createdAt = moment.utc().toDate().getTime();
    let title = `${companyName} - Perion Stats, Failed to Import. Trying again in 1 hour.`;
    const notification = await Notifications.insert({ title, content: title, createdAt }).one();
    const notificationId = notification._id;
    const sender = "system";
    await db.query(`FOR u IN users FILTER u.role == 1 INSERT { notificationId: "${notificationId}", sender: "${sender}", receiver: u._id, status: false, createdAt: ${createdAt}, show: "active" } INTO subnotifications RETURN NEW`);
    setTimeout(function () {
        a2oPerionStatCronJob();
    }, 1000 * 60 * 60);
    console.log(title);
}

//get access token
function getAccessToken() {
    var options = {
        'method': 'POST',
        'url': 'https://auth.codefuel.com/oauth/token',
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': 'did=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU; did_compat=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU'
        },
        body: JSON.stringify({
            "client_id": "ZFLYfEDwFc6NODR9CxpTvufHLcfFHHAT",
            "client_secret": "o8FEEskecAlX6OlflX6A61Ig6P8GTRHq_ZhhADEaAUwJg8V08dZp4RiaQGhPL6Ub",
            "audience": "codefuel-api",
            "grant_type": "client_credentials"
        })

    };

    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body)
            } else {
                reject(error);
            }
        });
    });

}


module.exports = {
    a2oPerionStatCronJob,
}