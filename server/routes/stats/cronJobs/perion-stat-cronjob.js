var moment = require('moment');
const { db } = require('../../../services/arango');
const request = require('request');
const aql = require('arangojs').aql;

//Cron Job Perion function
async function perionStatCronJob() {
    console.log('Perion Cron Job start!');
    var startDate = moment().utc().subtract(3, "days").format("YYYY-MM-DD");
    var endDate = moment().utc().subtract(3, "days").format("YYYY-MM-DD");

    //GET Perion Data From Company
    let companyAql = `FOR company in companies FILTER company.name != "BrandClick" FOR provider IN company.reportingProviders FILTER provider.reportingProvider == "perion" RETURN company`
    try {
        const companyCursor = await db.query(companyAql);
        let companyInformation = await companyCursor.all();
        for (var companyStat of companyInformation) {
            var companyName = companyStat.name;
            for (var companyReportingProvider of companyStat.reportingProviders) {
                if (companyReportingProvider.reportingProvider == "perion") {
                    var perionEmail = companyReportingProvider.email;
                    var perionPassword = companyReportingProvider.password;
                    var perionApiUrl = companyReportingProvider.apiUrl;
                    var perionApiKey = companyReportingProvider.apiKey;
                    if (perionEmail && perionPassword) {
                        //SETUP LOGIN HEADERS
                        var jar = request.jar();

                        var login_headers = {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
                            'Origin': 'https://services.hub.codefuel.com/login',
                            'Referer': 'https://services.hub.codefuel.com/login',
                            'Accept': 'ttext/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'upgrade-insecure-requests': 1
                        }

                        let loginStatus = await loginSession(perionEmail, perionPassword, jar, login_headers)
                        console.log("Inside UI, getting data: ", loginStatus)
                        if (loginStatus) {
                            //All Channel URL
                            let report_url = `https://services.hub.codefuel.com/analytics/reports?channelQueryType=all_channels&columnQueryData=%7B%22ids%22:%5B%22date%22,%22channel%22,%22country%22,%22revenue%22,%22searches%22,%22searches_monetized%22,%22ad_impressions%22,%22ad_clicks%22,%22publisher_cpc%22,%22monetized_ctr%22,%22coverage%22%5D%7D&columnQueryType=specific_columns&endDate=${endDate}&geoQueryType=all&limit=100000000&productQueryType=all_product&startDate=${startDate}&walletQueryType=all_wallets`;
                            console.log(report_url)

                            //REQUEST DASHBOARD PAGE DATA
                            var report_headers = {
                                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36',
                                'Origin': 'https://admin.hub.codefuel.com',
                                'Referer': 'https://admin.hub.codefuel.com/',
                                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                                'upgrade-insecure-requests': 1
                            }

                            let dashPageData = await getDashboardPageData(jar, report_url, report_headers);
                            let rawPerionStats = await convertStringToJsonObject(dashPageData);
                            let perionData = [];
                            rawPerionStats.rows.forEach((row) => {
                                let stat = {};
                                if (row.wallet) {
                                    stat = {
                                        company_id: `companies/${companyStat._key}`,
                                        date: row.date + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                                        country: '',
                                        subid: 'bonus',
                                        impressions: 0,
                                        monetized_impressions: 0,
                                        clicks: 0,
                                        revenue: (parseFloat(row.revenue) || 0.00),
                                        bing_searches_initial: 0,
                                        bing_searches_followon: 0,
                                        bing_monetized_searches_initial: 0,
                                        bing_monetized_searches_followon: 0,
                                        split: 0
                                    }

                                } else {
                                    stat = {
                                        company_id: `companies/${companyStat._key}`,
                                        date: row.date + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                                        country: row.country.toString(),
                                        subid: row.channel,
                                        impressions: (parseInt(row.searches) || 0),
                                        monetized_impressions: (parseInt(row.searches_monetized) || 0),
                                        clicks: (parseInt(row.ad_clicks) || 0),
                                        revenue: (parseFloat(row.revenue) || 0.00),
                                        bing_searches_initial: (parseFloat(row.bing_searches_initial) || 0.00),
                                        bing_searches_followon: (parseFloat(row.bing_searches_followon) || 0.00),
                                        bing_monetized_searches_initial: (parseFloat(row.bing_monetized_searches_initial) || 0.00),
                                        bing_monetized_searches_followon: (parseFloat(row.bing_monetized_searches_followon) || 0.00),
                                        split: 0
                                    }
                                }
                                perionData.push(stat);
                            });
 
                            let processData = JSON.stringify(perionData);
                            let nameChange = companyName.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
                            let perionCollectionName = (`${nameChange.join("")}_perion_stat_reports`).toString()
                            console.log(perionData.length, perionCollectionName)
                            try {
                                await db.query(`FOR doc IN ${processData} UPSERT { date: doc.date, country: doc.country, subid: doc.subid } INSERT doc UPDATE { company_id: doc.company_id, date:doc.date,country:doc.country,subid:doc.subid,impressions:doc.impressions,monetized_impressions:doc.monetized_impressions,clicks:doc.clicks,revenue:doc.revenue,bing_searches_initial:doc.bing_searches_initial,bing_searches_followon:doc.bing_searches_followon,bing_monetized_searches_initial:doc.bing_monetized_searches_initial,bing_monetized_searches_followon:doc.bing_monetized_searches_followon} IN ${perionCollectionName}`)
                                
                            } catch (error) {
                                console.log(error)
                            }
                        }

                    }
                }
            }
        }
    } catch (error) {
        console.log('Error: ' + error);
    }
    console.log('Perion Cron Job End!');
}
/**
 * *Converts String to JSON Object
 *  @param {*} data 
 */
function convertStringToJsonObject(data) {
    return JSON.parse(data);
}

//login api 
function loginSession(perionEmail, perionPassword, jar, login_headers) {
    return new Promise(function (resolve, reject) {
        request({
            uri: 'https://services.hub.codefuel.com/login',
            method: "POST",
            form: {
                email: perionEmail,
                password: perionPassword
            },
            jar: jar,
            timeout: 60000,
            headers: login_headers,
            followRedirect: true
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //THIS BODY WILL SHOW A REDIRECTING MESSAGE IF SUCCESS, OTHERWISE WILL SPIT OUT LOGIN FORM HTML
                resolve(body);
            } else {
                reject(error);
            }

        })
    })
}

//get data from api for perion
function getDashboardPageData(jar, report_url, report_headers) {
    return new Promise(function (resolve, reject) {
        request({
            uri: report_url,
            method: "GET",
            jar: jar,
            timeout: 20000,
            followRedirect: true,
            maxRedirects: 10,
            headers: report_headers
        }, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                resolve(response.body);
            } else {
                reject(error);
            }

        })
    }) 
}
module.exports = {
    perionStatCronJob,
}