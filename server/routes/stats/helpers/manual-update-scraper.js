const moment = require('moment');
const request = require('request');
const { db, Companies, Tags } = require('../../../services/arango')
const aql = require('arangojs').aql;
const helperFunctions = require('./date-formatter');
var axios = require('axios');
var jwt = require('jsonwebtoken');
var https = require('https');
var fs = require('fs');
const { unzip } = require('zip-unzip-promise');
const { XMLParser } = require("fast-xml-parser");

//BEGIN SCRAPING LOGIC
function getRawPerionStats(company, start, end) {
    return new Promise(async (resolve, reject) => {
        try {
            var startDate = moment.utc(start).format("YYYY-MM-DD");
            var endDate = moment.utc(end).format("YYYY-MM-DD");
            let companyInfo = await Companies.find().where({ _id: company }).one().limit(1);
            let perionData = [];
            if (companyInfo) {
                if (companyInfo.name == "BrandClick") {
                    for (var reportingProvider of companyInfo.reportingProviders) {
                        if (reportingProvider.reportingProvider == "perion") {
                            let accessTokenStatus = await getAccessToken();
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
                                                company_id: `companies/${companyInfo._key}`,
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
                                        resolve(perionData);
                                        return;

                                    } else {
                                        console.log(error);
                                        resolve(perionData);
                                        return;
                                    }
                                });
                            }
                        }
                    }
                } else if (companyInfo.name == "Apex Extensions") {
                    for (var reportingProvider of companyInfo.reportingProviders) {
                        if (reportingProvider.reportingProvider == "perion") {
                            let accessApexTokenStatus = await getApexAccessToken();
                            if (accessApexTokenStatus) {
                                let token = JSON.parse(accessApexTokenStatus).access_token;
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
                                                company_id: `companies/${companyInfo._key}`,
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

                                        resolve(perionData);
                                        return;
                                    } else {
                                        resolve(perionData);
                                        return;
                                    }
                                });
                            }

                        }
                    }
                } else if (companyInfo.name == "A2O Media") {
                    for (var reportingProvider of companyInfo.reportingProviders) {
                        if (reportingProvider.reportingProvider == "perion") {
                            let accessA2OTokenStatus = await getA2OAccessToken();
                            if (accessA2OTokenStatus) {
                                let token = JSON.parse(accessA2OTokenStatus).access_token;
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
                                                company_id: `companies/${companyInfo._key}`,
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
                                        resolve(perionData);
                                        return;

                                    } else {
                                        resolve(perionData);
                                        return;
                                    }
                                });
                            }

                        }
                    }
                } else if (companyInfo.name == "Peak 8 Media") {
                    for (var reportingProvider of companyInfo.reportingProviders) {
                        if (reportingProvider.reportingProvider == "perion") {
                            let accessPeak8TokenStatus = await getPeak8AccessToken();
                            if (accessPeak8TokenStatus) {
                                let token = JSON.parse(accessPeak8TokenStatus).access_token;
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
                                                company_id: `companies/${companyInfo._key}`,
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
                                        resolve(perionData);
                                        return;

                                    } else {
                                        resolve(perionData);
                                        return;
                                    }
                                });
                            }

                        }
                    }
                } else if (companyInfo.name == "Monarch Digital") {
                    for (var reportingProvider of companyInfo.reportingProviders) {
                        if (reportingProvider.reportingProvider == "perion") {
                            let accessDigitalTokenStatus = await getDigitalAccessToken();
                            if (accessDigitalTokenStatus) {
                                let token = JSON.parse(accessDigitalTokenStatus).access_token;
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
                                                company_id: `companies/${companyInfo._key}`,
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

                                        resolve(perionData);
                                        return;

                                    } else {
                                        resolve(perionData);
                                        return;
                                    }
                                });
                            }

                        }
                    }
                } else if (companyInfo.name == "Manic Traffic") {
                    for (var reportingProvider of companyInfo.reportingProviders) {
                        if (reportingProvider.reportingProvider == "perion") {
                            let accessManicTokenStatus = await getManicAccessToken();
                            if (accessManicTokenStatus) {
                                let token = JSON.parse(accessManicTokenStatus).access_token;
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
                                                company_id: `companies/${companyInfo._key}`,
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
                                        resolve(perionData);
                                        return;

                                    } else {
                                        resolve(perionData);
                                        return;
                                    }
                                });
                            }

                        }
                    }
                }
            }
        } catch (err) {
            reject(err)
            process.exit();
        }
    });
}

function getRawLyonsStats(company, start, end) {
    return new Promise(async (resolve, reject) => {
        try {
            var startDate = moment.utc(start).format("YYYY-MM-DD");
            var endDate = moment.utc(end).format("YYYY-MM-DD");
            var lyonData = [];
            var config = {
                method: 'get',
                url: `http://rt.api.imageadvantage.net/PublisherAPIReports/?StartDate=${startDate}&EndDate=${endDate}&Key=8r4nd(1!(k494!&ReportType=0`,
                headers: {}
            };
            axios(config)
                .then(async function (response) {
                    var respond_data = response.data.split(/\r?\n/);

                    for (var i = 1; i < respond_data.length - 1; i++) {
                        var subdata = respond_data[i].split(',');
                        let stat = {}
                        stat = {
                            date: moment.utc(subdata[0], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                            ma: subdata[1],
                            subid: subdata[2] + "_" + subdata[3],
                            searches: subdata[4],
                            biddedSearches: subdata[5],
                            clicks: subdata[6],
                            biddedCTR: subdata[7],
                            ctr: subdata[8],
                            split: 0,
                            revenue: subdata[9],
                            tqScore: subdata[10],
                        }
                        lyonData.push(stat);
                    }
                    resolve(lyonData);
                    return;
                })
                .catch(function (error) {
                    reject(error)
                    process.exit();
                });
        } catch (err) {
            reject(err)
            process.exit();
        }
    });
}

function getRawRubiStats(company, start, end) {
    return new Promise(async (resolve, reject) => {
        try {
            try {
                var startDate = moment.utc(start).format("YYYY-MM-DD");
                var endDate = moment.utc(end).format("YYYY-MM-DD");
                var config = {
                    method: 'get',
                    url: `https://publisher.aka-api.com/api/publisher/reports?apiKey=b8ccd84e-345b-4196-b09b-c60e4c2ab1a9&format=json&fromDate=${startDate}&toDate=${endDate}`,
                    headers: {}
                };
                axios(config)
                    .then(async function (response) {
                        let rubiData = [];
                        for (var res_data of response.data) {
                            if (res_data.rows.length > 0) {
                                for (var subData of res_data.rows) {
                                    var stat = {
                                        date: moment.utc(subData.Date, "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                                        publisher: subData.Publisher,
                                        subid: subData.SubID,
                                        geo: subData.GEO,
                                        total_searches: subData['Total Searches'],
                                        monetized_searches: subData['MonetizedSearches'],
                                        clicks: subData.Clicks,
                                        revenue: subData["Net Revenue"],
                                        split: 0
                                    }
                                    rubiData.push(stat)
                                }
                            }
                        }
                        resolve(rubiData);
                        return;
                    })
                    .catch(function (error) {
                        reject(err)
                        process.exit();
                    });

            } catch (error) {
                reject(err)
                process.exit();
            }
        } catch (err) {
            reject(err)
            process.exit();
        }
    });
}

function getRawVerizonDirectStats(company, start, end) {
    return new Promise(async (resolve, reject) => {
        try {

        } catch (err) {
            reject(err)
            process.exit();
        }
    });
}

function getRawSolexBCStats(company, start, end) {
    return new Promise(async (resolve, reject) => {
        try {
            let startDate = moment.utc(start).format("YYYY-MM-DD");
            let endDate = moment.utc(end).format("YYYY-MM-DD");
            var axiosArray = [];
            var solexBCData = [];
            var solexBaseData = [
                {
                    'tagId': '7023.605',
                    'secret': 'g27OnPIfHOL5aMVA1VSj6'
                },
                {
                    'tagId': '7023.671',
                    'secret': '2hy0Mc8BvNo5HOfndbV08'
                },
                {
                    'tagId': '7023.743',
                    'secret': '1ErYV2YoNAQJ4a7QRIyLe'
                },
                {
                    'tagId': '7023.827',
                    'secret': 'ETXTJfXq0RWsLEwwcVM91'
                },
            ];
            for (var solexBase of solexBaseData) {
                axiosArray.push(axios({
                    method: 'get',
                    url: `https://r.a9g.io/r/v1?s=${solexBase.tagId}&k=${solexBase.secret}&start=${startDate}&end=${endDate}`,
                    headers: {}
                }))
            }
            try {
                const resData = await axios.all(axiosArray);
                for (var res of resData) {
                    for (var i = 1; i < res.data.split(/\r\n|\n/).length - 1; i++) {
                        var subData = res.data.split(/\r\n|\n/)[i].split(',');
                        let stat = {};
                        stat = {
                            date: moment.utc(subData[0].replace('"', ''), "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                            subid: subData[1].replace('"', '').replace('\"', ''),
                            country: subData[2].replace('"', '').replace('\"', ''),
                            searches: subData[3].replace('"', ''),
                            searchesPaid: subData[4].replace('"', ''),
                            clicks: subData[6].replace('"', ''),
                            revenue: subData[7].replace('"', ''),
                            split: 0
                        }
                        solexBCData.push(stat);
                    }
                }
                resolve(solexBCData);
                return;
            } catch (err) {
                console.log("=====", err)
                reject(err)
                process.exit();
            }
        } catch (err) {
            console.log("===err==", err)
            reject(err)
            process.exit();
        }
    });
}

function getRawApptitudeStats(company, start, end) {
    return new Promise(async (resolve, reject) => {
        try {
            var startDate = moment.utc(start).format("YYYY-MM-DD");
            var endDate = moment.utc(end).format("YYYY-MM-DD");

            var monarchApptitudeData = [];
            var body = {
                startDate: startDate,
                endDate: endDate,
                formcodes: [],
                markets: [],
                ptagIds: [],
                dataSource: "ptagreporting",
                dataFormat: "rawcsv",
                dataFormatOptions: {
                    columns_header: true,
                    quoted_fields: false,
                    field_delimiter: ",",
                    record_delimiter: "\n"
                }
            }

            var data = JSON.stringify(body);

            var config = {
                method: 'post',
                url: 'https://searchapi.sien.com/api/v2/ATMD/searchdata',
                headers: {
                    'User': 'monarchdigital_prog',
                    'ApiKey': '662cb41993bc515b44cd9da1219a3ade459010621',
                    'Content-Type': 'application/json'
                },
                data: data
            };

            axios(config)
                .then(async function (response) {
                    var respond_data = response.data.split(/\r?\n/);

                    for (var i = 1; i < respond_data.length; i++) {
                        var subdata = respond_data[i].split(',');
                        let stat = {}
                        stat = {
                            date: moment.utc(subdata[0], "YYYY-MM-DD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                            partner: subdata[1],
                            formcode: subdata[2],
                            subid: subdata[3],
                            country: subdata[4],
                            clicks: subdata[5],
                            searches: subdata[6],
                            rsearches: subdata[7],
                            filtering: subdata[8],
                            revenue: Math.abs(subdata[9]),
                            adimpressions: subdata[10],
                            rpm: Math.abs(subdata[11]),
                            cpc: subdata[12],
                            adctr: subdata[13],
                            isfollowon: subdata[14],
                            browser: subdata[15],
                            devicetype: subdata[16],
                            websitecountry: subdata[17],
                            split: 0,
                        }

                        monarchApptitudeData.push(stat);
                    }
                    resolve(monarchApptitudeData);
                    return;
                })
                .catch(function (err) {
                    reject(err)
                    process.exit();
                });
        } catch (err) {
            reject(err)
            process.exit();
        }
    });
}

function getRawHopkinStats(company, start, end) {
    return new Promise(async (resolve, reject) => {
        try {
            var startDate = moment.utc(start).format("YYYY-MM-DD");
    var endDate = moment.utc(end).format("YYYY-MM-DD");

    var config = {
        method: 'get',
        url: `https://adserver.onevent.io/xml/report?key=X9LxVG87xEpPABT2Y&date=${startDate}`,
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
                resolve(hopkinData);
                return;
            } else {
                resolve(hopkinData);
                return;
            }
        })
        .catch(function (err) {
            reject(err)
            process.exit();
        });
        } catch (err) {
            reject(err)
            process.exit();
        }
    });
}

//Begin Verizon Scraping(partner Insight) and Upsert
async function updateVerizonStats(company, start, end) {
    let requestStartDate = moment.utc(start).format("YYYYMMDD");
    let requestEndDate = moment.utc(end).format("YYYYMMDD");
    var b2bHost = "id.b2b.yahooinc.com"
    var accessTokenURL = "https://" + b2bHost + "/identity/oauth2/access_token";
    var grantType = "client_credentials";
    var scope = "pi-api-access";
    var realm = "pi";
    var clientAssertionType = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
    var clientId = process.env.PARTNER_INSIGHTS_CLIENT_ID; //Fill your client id
    var clientSecret = process.env.PARTNER_INSIGHTS_CLIENT_SECRET; //Fill your client secret 

    var generateJWT = function () {
        var token = jwt.sign({
            "aud": "https://" + b2bHost + "/identity/oauth2/access_token?realm=" + realm,
            "iss": clientId,
            "sub": clientId,
            "exp": Math.floor(Date.now() / 1000) + (10 * 60),
            "iat": Math.floor(Date.now() / 1000)
        }, clientSecret);

        return token;
    }

    var getAccessToken = function (callback) {
        request.post(accessTokenURL, {
            form: {
                "grant_type": grantType,
                "client_assertion_type": clientAssertionType,
                "realm": realm,
                "scope": scope,
                "client_assertion": generateJWT()
            }
        }, function optionalCallback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var bodyJson = JSON.parse(body);
                console.log(" ******** token *********", bodyJson.access_token);
                callback(bodyJson.access_token);
            } else {
                console.log("something wrong. please check", error)
            }

        });

    }
    var invokeGetDataAvailablity = function (accessToken) {
        var url = `https://api-partnerinsights.yahoo.com/PartnerAnalytics/service/ReportsAPI/getDataAvailability?reportType=Source&format=json&rollup=Daily&startDate=${requestStartDate}&endDate=${requestEndDate}`;
        var options = {
            url: url,
            strictSSL: false,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                getReportDetail(accessToken);
            } else {
                console.log("something wrong. please check")
            }
        });
    };

    var getReportDetail = function (accessToken) {
        var url = `https://api-partnerinsights.yahoo.com/PartnerAnalytics/service/ReportsAPI/getTypeDetailReport?userId=haydenm_brandclick_pi&startDate=${requestStartDate}&endDate=${requestEndDate}&attributeList=user+country%2Csource+tag%2C+type+tag&mrkt_id=ALL&product=ALL&channel=&currency=0&sourceTag=%2A&orderBy=DATA+DATE&sortOrder=&startRow=1&returnRows=10000&dateRollup=Daily&dateRange=CUSTOM&type=ASYNC&label=&partnerList=brand&format=json&appVer=307&scheduleFrequency=1&scheStartDate=${requestStartDate}&scheEndDate=${requestEndDate}&rv=0&device=ALL`;
        var options = {
            url: url,
            strictSSL: false,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var bodyJson = JSON.parse(body);
                var jobId = bodyJson.ResultSet.Row.ID;
                console.log("********** bodyJson **********", bodyJson)
                if (bodyJson.MetaInfo && bodyJson.MetaInfo.ResponseStatus == 'SUCCESS') {
                    getAsyncJobStatus(accessToken, jobId);
                } else {
                    console.log("ReportDetail Api is something wrong. please check")
                }

            } else {
                console.log("something wrong. please check")
            }
        });
    }

    var getAsyncJobStatus = function (accessToken, jobId) {
        var url = `https://api-partnerinsights.yahoo.com/PartnerAnalytics/service/ReportsAPI/getAsyncJobStatus?asyncJobId=${jobId}&fileFormat=json&format=json`;
        var options = {
            url: url,
            strictSSL: false,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var bodyJson = JSON.parse(body);
                console.log("==========bodyJson=========", bodyJson)
                if (bodyJson.MetaInfo && bodyJson.MetaInfo.ResponseStatus == 'SUCCESS' && bodyJson.ResultSet.Row.REPORT_STATUS == 'Completed') {
                    reportDownload(bodyJson.ResultSet.Row.REPORT_OUTPUT_FILE, accessToken);
                } else {
                    setTimeout(() => {
                        getAsyncJobStatus(accessToken, jobId);
                    }, 5000)

                    console.log("AsyncJobStatus Api is something wrong. Retrying!")
                }
            } else {
                console.log("something wrong. please check")
            }
        });
    }

    getAccessToken(invokeGetDataAvailablity);
}

function reportDownload(fileUrl, accessToken) {
    var options = {
        hostname: `partnerinsights.yahoo.com`,
        path: '/?' + fileUrl.split('/?')[fileUrl.split('/?').length - 1],
        strictSSL: false,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
    };
    var fileNameArr = fileUrl.split('/');
    var fileName = fileNameArr[fileNameArr.length - 1];
    var filePath = './media/partner-insight/' + fileName;

    https.get(options, (res) => {
        if (res.statusCode == 200) {
            // Open file in local filesystem
            const file = fs.createWriteStream(filePath);
            // Write data into local file
            res.pipe(file);

            // Close the file
            file.on('finish', async () => {
                file.close();
                console.log(`File downloaded!`);
                await fileUnzip(filePath, fileName);
            });

        } else {
            console.log("something wrong. please check")
        }
    }).on("error", (err) => {
        console.log("Error: ", err.message);
    });

}

//unzip file and read json
async function fileUnzip(filePath, name) {
    await unzip(filePath, './media/partner-insight/');

    var statName = name.split('.').slice(0, 2).join('.');
    getPartnerStat(statName);

}

//read json
function getPartnerStat(statName) {
    fs.readFile('./media/partner-insight/' + statName, 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        var verizonData = obj.ResultSet.Row;
        saveVerizonStat(verizonData);
    });
}

//save the data to verizon
function saveVerizonStat(verizonData) {
    var verizonList = [];
    if (verizonData.length > 0) {
        for (var verizon of verizonData) {
            var verizonStat = {
                date: moment.utc(verizon.DATA_DATE, "YYYYMMDD").startOf('day').toDate().getTime() + moment.utc(1000 * 60 * 60 * 10).toDate().getTime(),
                sourceTag: verizon.SOURCE_TAG,
                userCountry: verizon.USER_COUNTRY,
                subid: verizon.TYPE_TAG,
                searches: verizon.SEARCHES,
                biddedSearches: verizon.BIDDED_SEARCHES,
                biddedResults: verizon.BIDDED_RESULTS,
                biddedClicks: verizon.BIDDED_CLICKS,
                revenue: verizon.ESTIMATED_GROSS_REVENUE,
                coverage: verizon.COVERAGE,
                ctr: verizon.CTR,
                cpc: verizon.PPC,
                tqScore: verizon.TQ_SCORE,
                rn: verizon.RN,
                split: 0
            }
            verizonList.push(verizonStat)
        }
    }
    try {
        db.query(aql`FOR doc IN ${verizonList} UPSERT { date: doc.date, sourceTag: doc.sourceTag, userCountry: doc.userCountry, searches: doc.searches, biddedSearches: doc.biddedSearches, biddedResults: doc.biddedResults, biddedClicks: doc.biddedClicks, revenue: doc.revenue, coverage: doc.coverage, ctr: doc.ctr, cpc: doc.cpc, tqScore: doc.tqScore, rn: doc.rn } INSERT doc UPDATE {date: doc.date, sourceTag: doc.sourceTag, userCountry: doc.userCountry, searches: doc.searches, biddedSearches: doc.biddedSearches, biddedResults: doc.biddedResults, biddedClicks: doc.biddedClicks, revenue: doc.revenue, coverage: doc.coverage, ctr: doc.ctr, cpc: doc.cpc, tqScore: doc.tqScore, rn: doc.rn } IN verizon_direct_reports`);
    } catch (error) {
        console.log(error)
    }
    console.log("Verizon Direct Add And Update End!")

}

//Solex BC part
async function updateSolexBCStats(company, stats) {
    try {
        await db.query(aql`FOR doc IN ${stats} UPSERT { date: doc.date, subid: doc.subid, country: doc.country } INSERT doc UPDATE { date: doc.date, subid: doc.subid, country: doc.country, searches: doc.searches,searchesPaid: doc.searchesPaid, clicks: doc.clicks, revenue: doc.revenue } IN solexbc_stat_reports`);
    } catch (error) {
        console.log(error)
    }
    console.log("Successfully Upserted!");
}

//Begin Rubi scraping logic and Upsert
async function updateRubiStats(company, stats) {
    try {
        await db.query(aql`FOR stat IN ${stats} UPSERT { date: stat.date, publisher: stat.publisher, subid: stat.subid, geo: stat.geo, total_searches: stat.total_searches, monetized_searches: stat.monetized_searches, clicks: stat.clicks, revenue: stat.revenue } INSERT stat UPDATE {date: stat.date, publisher: stat.publisher, subid: stat.subid, geo: stat.geo, total_searches: stat.total_searches, monetized_searches: stat.monetized_searches, clicks: stat.clicks, revenue: stat.revenue} IN rubi_stat_reports`);
    } catch (error) {
        console.log(err)
    }
    console.log("Rubi Add And Update End!")
}

//Begin Apptitude scraping logic and Upsert
async function updateApptitudeStats(company, stats) {
    try {
        await db.query(aql`FOR stat IN ${stats} UPSERT { date: stat.date, partner: stat.partner, subid: stat.subid, formcode: stat.formcode, country: stat.country, clicks: stat.clicks, websitecountry: stat.websitecountry, devicetype: stat.devicetype, revenue: stat.revenue } INSERT stat UPDATE {date: stat.date, partner: stat.partner, formcode: stat.formcode, subid: stat.subid, country: stat.country, clicks: stat.clicks, searches: stat.searches, rsearches: stat.rsearches, filtering: stat.filtering, revenue: stat.revenue, adimpressions: stat.adimpressions, rpm: stat.rpm, cpc: stat.rpm, adctr: stat.adctr, isfollowon: stat.isfollowon, browser: stat.browser, devicetype: stat.devicetype, websitecountry: stat.websitecountry } IN monarch_apptitudes`);

    } catch (error) {
        console.log('Error Upsert Monarch Apptitude Stat: ' + error)
    }
    console.log('********* Monarch Apptitude update End! *********');
}

//Begin Hopkins YHS scraping logic and Upsert
async function updateHopkinStats(company, stats) {
    try {
        await db.query(aql`FOR stat IN ${stats} UPSERT { date: stat.date, subid: stat.subid, searches: stat.searches, biddedSearches: stat.biddedSearches, clicks: stat.clicks, revenue: stat.revenue } INSERT stat UPDATE { date: stat.date, market: stat.market, currency: stat.currency, device: stat.device, subid: stat.subid, searches: stat.searches, biddedSearches: stat.biddedSearches, clicks: stat.biddedClicks, revenue: stat.revenue, coverage: stat.coverage, ppc: stat.ppc, tq: stat.tq, sourceTQ: stat.sourceTQ, split: stat.split } IN hopkin_stat_reports`);
    } catch (error) {
        console.log(error)
    }
}


//Begin lyon scraping and upsert
async function updateLyonStats(company, stats) {
    try {
        await db.query(aql`FOR stat IN ${stats} UPSERT { date: stat.date, subid: stat.subid, searches: stat.searches, biddedSearches: stat.biddedSearches, biddedCTR: stat.biddedCTR, ctr: stat.ctr, clicks: stat.clicks, revenue: stat.revenue, tqScore: stat.tqScore } INSERT stat UPDATE {date: stat.date, ma: stat.ma, subid: stat.subid, searches: stat.searches, biddedSearches: stat.biddedSearches, biddedCTR: stat.biddedCTR, ctr: stat.ctr, split: stat.split, clicks: stat.clicks, revenue: stat.revenue, tqScore: stat.tqScore } IN lyon_stat_reports`);

    } catch (error) {
        console.log('Error Upsert Lyon Stat: ' + error)
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

async function updatePerionDocuments(company, stats) {
    let companyInfo = await Companies.find().where({ _id: company }).one().limit(1);
    if (companyInfo) {
        if (companyInfo.name == "BrandClick") {
            var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
            var perionCollectionName = `${company_name.join("")}_perion_stat_reports`;
            let processData = JSON.stringify(stats);
            try {
                // await db.query(`FOR doc IN ${processData} INSERT doc INTO ${perionCollectionName}`);
                await db.query(`FOR doc IN ${processData} UPSERT {date: doc.date, country_code: doc.country_code, subid: doc.subid, provider: doc.provider, product: doc.product } INSERT doc UPDATE {date: doc.date, country_code: doc.country_code, country_name: doc.country_name, subid: doc.subid, provider: doc.provider, product: doc.product, wallet: doc.wallet, revenue: doc.revenue, monetized_searches: doc.monetized_searches, total_searches: doc.total_searches, ad_clicks: doc.ad_clicks, cf_initial_searches: doc.cf_initial_searches, bing_initial_searches: doc.bing_initial_searches, ad_impressions: doc.ad_impressions, bing_follow_on_searches: doc.bing_follow_on_searches, cpc: doc.cpc, ctr: doc.ctr, coverage_cf: doc.coverage_cf, coverage_bing: doc.coverage_bing, follow_on_searches_percentage: doc.follow_on_searches_percentage, initial_searches_diff: doc.initial_searches_diff, initial_searches_rpm: doc.initial_searches_rpm } IN ${perionCollectionName}`);
            } catch (error) {
                console.log(error);
            }
        } else if (companyInfo.name == "Apex Extensions") {
            var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
            var perionCollectionName = `${company_name.join("")}_perion_stat_reports`;
            let processData = JSON.stringify(stats);

            try {
                await db.query(`FOR doc IN ${processData} UPSERT {date: doc.date, country_code: doc.country_code, subid: doc.subid, provider: doc.provider, product: doc.product } INSERT doc UPDATE {date: doc.date, country_code: doc.country_code, country_name: doc.country_name, subid: doc.subid, provider: doc.provider, product: doc.product, wallet: doc.wallet, revenue: doc.revenue, monetized_searches: doc.monetized_searches, total_searches: doc.total_searches, ad_clicks: doc.ad_clicks, cf_initial_searches: doc.cf_initial_searches, bing_initial_searches: doc.bing_initial_searches, ad_impressions: doc.ad_impressions, bing_follow_on_searches: doc.bing_follow_on_searches, cpc: doc.cpc, ctr: doc.ctr, coverage_cf: doc.coverage_cf, coverage_bing: doc.coverage_bing, follow_on_searches_percentage: doc.follow_on_searches_percentage, initial_searches_diff: doc.initial_searches_diff, initial_searches_rpm: doc.initial_searches_rpm } IN ${perionCollectionName}`);
            } catch (error) {
                console.log(error);
            }
        } else if (companyInfo.name == "A2O Media") {
            var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
            var perionCollectionName = `${company_name.join("")}_perion_stat_reports`;
            let processData = JSON.stringify(stats);

            try {
                await db.query(`FOR doc IN ${processData} UPSERT {date: doc.date, country_code: doc.country_code, subid: doc.subid, provider: doc.provider, product: doc.product } INSERT doc UPDATE {date: doc.date, country_code: doc.country_code, country_name: doc.country_name, subid: doc.subid, provider: doc.provider, product: doc.product, wallet: doc.wallet, revenue: doc.revenue, monetized_searches: doc.monetized_searches, total_searches: doc.total_searches, ad_clicks: doc.ad_clicks, cf_initial_searches: doc.cf_initial_searches, bing_initial_searches: doc.bing_initial_searches, ad_impressions: doc.ad_impressions, bing_follow_on_searches: doc.bing_follow_on_searches, cpc: doc.cpc, ctr: doc.ctr, coverage_cf: doc.coverage_cf, coverage_bing: doc.coverage_bing, follow_on_searches_percentage: doc.follow_on_searches_percentage, initial_searches_diff: doc.initial_searches_diff, initial_searches_rpm: doc.initial_searches_rpm } IN ${perionCollectionName}`);
            } catch (error) {
                console.log(error);
            }
        } else if (companyInfo.name == "Peak 8 Media") {
            var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
            var perionCollectionName = `${company_name.join("")}_perion_stat_reports`;
            let processData = JSON.stringify(stats);

            try {
                await db.query(`FOR doc IN ${processData} UPSERT {date: doc.date, country_code: doc.country_code, subid: doc.subid, provider: doc.provider, product: doc.product } INSERT doc UPDATE {date: doc.date, country_code: doc.country_code, country_name: doc.country_name, subid: doc.subid, provider: doc.provider, product: doc.product, wallet: doc.wallet, revenue: doc.revenue, monetized_searches: doc.monetized_searches, total_searches: doc.total_searches, ad_clicks: doc.ad_clicks, cf_initial_searches: doc.cf_initial_searches, bing_initial_searches: doc.bing_initial_searches, ad_impressions: doc.ad_impressions, bing_follow_on_searches: doc.bing_follow_on_searches, cpc: doc.cpc, ctr: doc.ctr, coverage_cf: doc.coverage_cf, coverage_bing: doc.coverage_bing, follow_on_searches_percentage: doc.follow_on_searches_percentage, initial_searches_diff: doc.initial_searches_diff, initial_searches_rpm: doc.initial_searches_rpm } IN ${perionCollectionName}`);
            } catch (error) {
                console.log(error);
            }
        } else if (companyInfo.name == "Monarch Digital") {
            var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
            var perionCollectionName = `${company_name.join("")}_perion_stat_reports`;
            let processData = JSON.stringify(stats);
            try {
                await db.query(`FOR doc IN ${processData} UPSERT {date: doc.date, country_code: doc.country_code, subid: doc.subid, provider: doc.provider, product: doc.product } INSERT doc UPDATE {date: doc.date, country_code: doc.country_code, country_name: doc.country_name, subid: doc.subid, provider: doc.provider, product: doc.product, wallet: doc.wallet, revenue: doc.revenue, monetized_searches: doc.monetized_searches, total_searches: doc.total_searches, ad_clicks: doc.ad_clicks, cf_initial_searches: doc.cf_initial_searches, bing_initial_searches: doc.bing_initial_searches, ad_impressions: doc.ad_impressions, bing_follow_on_searches: doc.bing_follow_on_searches, cpc: doc.cpc, ctr: doc.ctr, coverage_cf: doc.coverage_cf, coverage_bing: doc.coverage_bing, follow_on_searches_percentage: doc.follow_on_searches_percentage, initial_searches_diff: doc.initial_searches_diff, initial_searches_rpm: doc.initial_searches_rpm } IN ${perionCollectionName}`);
            } catch (error) {
                console.log(error);
            }
        } else if (companyInfo.name == "Manic Traffic") {
            var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
            var perionCollectionName = `${company_name.join("")}_perion_stat_reports`;
            let processData = JSON.stringify(stats);

            try {
                await db.query(`FOR doc IN ${processData} UPSERT {date: doc.date, country_code: doc.country_code, subid: doc.subid, provider: doc.provider, product: doc.product } INSERT doc UPDATE {date: doc.date, country_code: doc.country_code, country_name: doc.country_name, subid: doc.subid, provider: doc.provider, product: doc.product, wallet: doc.wallet, revenue: doc.revenue, monetized_searches: doc.monetized_searches, total_searches: doc.total_searches, ad_clicks: doc.ad_clicks, cf_initial_searches: doc.cf_initial_searches, bing_initial_searches: doc.bing_initial_searches, ad_impressions: doc.ad_impressions, bing_follow_on_searches: doc.bing_follow_on_searches, cpc: doc.cpc, ctr: doc.ctr, coverage_cf: doc.coverage_cf, coverage_bing: doc.coverage_bing, follow_on_searches_percentage: doc.follow_on_searches_percentage, initial_searches_diff: doc.initial_searches_diff, initial_searches_rpm: doc.initial_searches_rpm } IN ${perionCollectionName}`);
            } catch (error) {
                console.log(error);
            }
        }

    }
}

async function updatePerionSplits(company, tagId, start, end) {
    console.log(`${tagId} updating split!`)
    let companyInfo = await Companies.find().where({ _id: company }).one().limit(1);
    var allData = [];
    if (companyInfo) {
        var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
        var company_id = companyInfo._id;
        var perionStatCollectionName = `${company_name.join("")}_perion_stat_reports`
        var startDate = moment(start).utc().startOf('day').toDate().getTime();
        var endDate = moment(end).utc().endOf('day').toDate().getTime();
        try {
            await db.query(`FOR stat IN ${perionStatCollectionName} FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'perion' && t._id == "${tagId}" && t.company == "${company_id}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(TO_STRING(stat.subid), ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(TO_STRING(stat.subid), ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(TO_STRING(stat.subid), ts.subid)) || (ts.filterTag == 'ExactValue' && TO_STRING(stat.subid) == ts.subid) UPDATE stat WITH {"split": ts.split} IN ${perionStatCollectionName}`)
        } catch (error) {
            console.log(error);
        }

    }
    return allData;
}

async function updateLyonsSplits(company, tagId, start, end) {
    console.log(`${tagId} updating split!`)
    var startDate = moment(start).utc().startOf('day').toDate().getTime();
    var endDate = moment(end).utc().endOf('day').toDate().getTime();
    try {
        await db.query(`FOR stat IN lyon_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'lyons' && t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN lyon_stat_reports`)
    } catch (error) {
        console.log(error);
    }
    // 
}

async function updateHopkinSplits(company, tagId, start, end) {
    console.log(`${tagId} updating split!`)
    var startDate = moment(start).utc().startOf('day').toDate().getTime();
    var endDate = moment(end).utc().endOf('day').toDate().getTime();
    try {
        await db.query(`FOR stat IN hopkin_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'hopkins' && t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN hopkin_stat_reports`)
    } catch (error) {
        console.log(error);
    }
}

async function updateSystem1Splits(company, tagId, start, end) {
    console.log(`${tagId} updating split!`)
    var startDate = moment(start).utc().startOf('day').toDate().getTime();
    var endDate = moment(end).utc().endOf('day').toDate().getTime();
    try {
        await db.query(`FOR stat IN system1_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'system1' && t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN system1_stat_reports`)
    } catch (error) {
        console.log(error);
    }
}

async function allTagSplitUpdate(company, start, end) {
    console.log(`All Tags updating split!`)
    var startDate = moment(start).utc().startOf('day').toDate().getTime();
    var endDate = moment(end).utc().endOf('day').toDate().getTime();
    let tagData = await Tags.find().where({ company: company });
    for (var tagD of tagData) {
        let reportType = tagD.advertiser;
        let tagId = tagD._id;
        if (reportType == 'rubi') {
            try {
                db.query(`FOR stat IN rubi_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN rubi_stat_reports`)
            } catch (error) {
                console.log(error);
            }
        } else if (reportType == "lyons") {
            try {
                db.query(`FOR stat IN lyon_stat_reports FILTER stat.rptDate >= ${startDate} && stat.rptDate <= ${endDate} FOR t IN tags FILTER t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN lyon_stat_reports`)
            } catch (error) {
                console.log(error);
            }
        } else if (reportType == "verizon-direct") {
            try {
                db.query(`FOR stat IN verizon_direct_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN verizon_direct_reports`)
            } catch (error) {
                console.log(error);
            }
        } else if (reportType == "perion") {
            let companyInfo = await Companies.find().where({ _id: company }).one().limit(1);
            if (companyInfo) {
                var company_name = companyInfo.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
                var company_id = companyInfo._id;
                var perionStatCollectionName = `${company_name.join("")}_perion_stat_reports`
                try {
                    db.query(`FOR tag IN tags FILTER tag._id == "${tagId}" && tag.company == "${company_id}" FOR subid IN tag.subids FOR stat IN ${perionStatCollectionName} FILTER stat.date >= ${startDate} && stat.date <= ${endDate} && TO_NUMBER(stat.subid) == TO_NUMBER(subid.subid) UPDATE stat WITH {"split": subid.split} IN ${perionStatCollectionName}`)
                } catch (error) {
                    console.log(error);
                }

            }
        } else if (reportType == "solex-bc") {
            try {
                db.query(`FOR stat IN solexbc_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN solexbc_stat_reports`)
            } catch (error) {
                console.log(error);
            }
        }
    }
}

async function updateRubiSplits(company, tagId, start, end) {
    console.log(`${tagId} updating split!`)
    var startDate = moment(start).utc().startOf('day').toDate().getTime();
    var endDate = moment(end).utc().endOf('day').toDate().getTime();
    try {
        await db.query(`FOR stat IN rubi_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'rubi' && t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN rubi_stat_reports`)
    } catch (error) {
        console.log(error);
    }

}

async function updateSolexbcSplits(company, tagId, start, end) {
    console.log(`${tagId} updating split!`)
    var startDate = moment(start).utc().startOf('day').toDate().getTime();
    var endDate = moment(end).utc().endOf('day').toDate().getTime();
    try {
        await db.query(`FOR stat IN solexbc_stat_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'solex-bc' && t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN solexbc_stat_reports`)
    } catch (error) {
        console.log(error);
    }
}

async function updateVerizonSplits(company, tagId, start, end) {
    console.log(`${tagId} updating split!`)
    var startDate = moment(start).utc().startOf('day').toDate().getTime();
    var endDate = moment(end).utc().endOf('day').toDate().getTime();
    try {
        db.query(`FOR stat IN verizon_direct_reports FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'verizon-direct' && t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN verizon_direct_reports`)
    } catch (error) {
        console.log(error);
    }

}

async function updateApptitudeSplits(company, tagId, start, end) {
    console.log(`${tagId} updating split!`)
    var startDate = moment(start).utc().startOf('day').toDate().getTime();
    var endDate = moment(end).utc().endOf('day').toDate().getTime();
    try {
        await db.query(`FOR stat IN monarch_apptitudes FILTER stat.date >= ${startDate} && stat.date <= ${endDate} FOR t IN tags FILTER t.advertiser == 'apptitude' && t._id == "${tagId}" && t.company == "${company}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(stat.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(stat.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(stat.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && stat.subid == ts.subid) UPDATE stat WITH {"split": ts.split} IN monarch_apptitudes`)
    } catch (error) {
        console.log(error);
    }
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
            "client_id": "U4nmEh6sKLOBa1d1uAIoNOU6YHBOpOwV",
            "client_secret": "Hshi1wMOMsbvz0Qogt9nIiZP9mqdmX8w74YPCIbSv7ih1l1F",
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

//get Apex access token
function getApexAccessToken() {
    var options = {
        'method': 'POST',
        'url': 'https://auth.codefuel.com/oauth/token',
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': 'did=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU; did_compat=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU'
        },
        body: JSON.stringify({
            "client_id": "Ics2REf4Ahy3qFg4oXAjF9XW71EN8ZwK",
            "client_secret": "MGtSIT4ZXQo-2ZQvL63mquoNJiNY5Ko24z3bVbC-UTBa2Xtw5ViXDguE2WaesIor",
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

//get A2O access token
function getA2OAccessToken() {
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

//get monarch digital access token
function getDigitalAccessToken() {
    var options = {
        'method': 'POST',
        'url': 'https://auth.codefuel.com/oauth/token',
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': 'did=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU; did_compat=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU'
        },
        body: JSON.stringify({
            "client_id": "hX8UVizUuUYVqoOdjwADgyloKjMt4pXI",
            "client_secret": "VHILTeDSqypR76e9QU2m4iflNvaMlcWs553BfPoA2gIoCGFbH1nnCwFe0wa1-elx",
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

//get Manic Traffic access token
function getManicAccessToken() {
    var options = {
        'method': 'POST',
        'url': 'https://auth.codefuel.com/oauth/token',
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': 'did=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU; did_compat=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU'
        },
        body: JSON.stringify({
            "client_id": "AzN7awxMqMxylyCIWi2nLMk5BtBJzZ8Z",
            "client_secret": "8va-pBHOyAc-il08sHju0ovrK2f-mippkiqFZgoe04g5cpM1seCuYWNQ-Er72P5G",
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

//get Peak 8 access token
function getPeak8AccessToken() {
    var options = {
        'method': 'POST',
        'url': 'https://auth.codefuel.com/oauth/token',
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': 'did=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU; did_compat=s%3Av0%3A8f0d3d40-7acc-11ed-83d1-1f6d097f0505.65xYnaZcjTsKLBecJtAxIkcVdOM%2BJ1S92ox8dogbQrU'
        },
        body: JSON.stringify({
            "client_id": "P8NkaSRf0PC3l65DW8FHcOzBk3EXtuC5",
            "client_secret": "0FQ66Jx2k5YUnf4GkfCsZTRSJMdmoR827iaZuMwGmUcfXalNJpPwUoGD3re7mEB0",
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

/**
 * *Converts String to JSON Object
 *  @param {*} data 
 */
function convertStringToJsonObject(data) {
    return JSON.parse(data);
}
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
    getRawPerionStats,
    updatePerionDocuments,
    updatePerionSplits,
    getRawLyonsStats,
    getRawRubiStats,
    getRawVerizonDirectStats,
    getRawSolexBCStats,
    getRawApptitudeStats,
    getRawHopkinStats,
    updateLyonsSplits,
    updateRubiSplits,
    updateRubiStats,
    updateLyonStats,
    allTagSplitUpdate,
    updateVerizonSplits,
    updateVerizonStats,
    updateSolexBCStats,
    updateSolexbcSplits,
    updateApptitudeStats,
    updateApptitudeSplits,
    updateHopkinStats,
    updateHopkinSplits,
    updateSystem1Splits
};