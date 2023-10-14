var express = require('express');
var moment = require('moment');
var router = express.Router();
// const { auth } = require('../middlewares/auth');
const CsvParser = require("json2csv").Parser;
const { User, db, Tags, Companies } = require('../services/arango');
// router.use(auth);

router.get('/reporting/api', async (req, res, next) => {
  const { apiKey, tag, startDate, endDate, reportFormat } = req.query;
  var tagId = `tags/${tag}`;
  var start_date = moment.utc(startDate, "MM-DD-YYYY").startOf('day').toDate().getTime();
  var end_date = moment.utc(endDate, "MM-DD-YYYY").endOf('day').toDate().getTime();
  const isExist = await User.find().where({ apiKey: apiKey }).one().limit(1);
  if (!isExist) {
    return res.status(400).send('Invalid API Key');
  }
  else {
    let tempList = [];
    let tempTags = Object.values(isExist.tagsId);
    for (let temp of tempTags) {
      for (let tempData of temp) {
        tempList.push(tempData);
      }
    }
    const userTags = tempList.length > 0 ? [...new Set(tempList)] : [];
    const checkTag = userTags.includes(tagId);
    console.log(userTags, checkTag, 'userTags');
    if (checkTag) {
      if (isExist.role == 3) {
        const tagExist = await Tags.find().where({ _id: tagId }).one().limit(1);
        if (tagExist) {
          var companyId = tagExist.company;
          const company = await Companies.find().where({ _id: companyId }).one().limit(1);
          if (!company) {
            return res.status(400).send('invalid Company');
          }

          var advertiser = tagExist.advertiser;
          let aql;
          if (advertiser == "perion") {
            var companyName = company.name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
            var companyid = company._id;
            var perionCollectionName = (`${companyName.join("")}_perion_stat_reports`).toString();
            aql = `FOR doc in ${perionCollectionName} FILTER doc.date >= ${start_date} && doc.date <= ${end_date} && doc.company_id == "${companyid}" FOR t IN tags FILTER t.advertiser == "perion" && t._id == "${tagId}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid, country = doc.country_code AGGREGATE revenue = SUM(doc.revenue),ctr = SUM(doc.ctr), cpc = SUM(doc.cpc), impressions = SUM(doc.ad_impressions), total_searches = SUM(doc.total_searches), monetized_searches = SUM(doc.monetized_searches), clicks = SUM(doc.ad_clicks), split = AVERAGE(TO_NUMBER(doc.split)), follow_on_searches_percentage = AVERAGE(TO_NUMBER(doc.follow_on_searches_percentage)) SORT date, TO_NUMBER(subid) DESC RETURN { date: DATE_FORMAT(DATE_ISO8601(date), '%yyyy-%mm-%dd'), subid, clicks, country, cpc: revenue*split/100/clicks, ctr: clicks/impressions, searches: total_searches, revenue: revenue*split/100, follow_on: follow_on_searches_percentage }`
          } else if (advertiser == "lyons") {
            aql = `FOR doc in lyon_stat_reports
              FILTER doc.date >= ${start_date} && doc.date <= ${end_date} FOR t IN tags FILTER t.advertiser == "lyons" && t._id == "${tagId}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), biddedSearches = SUM(TO_NUMBER(doc.biddedSearches)), clicks = SUM(TO_NUMBER(doc.clicks)), ctr = SUM(TO_NUMBER(doc.ctr)), biddedCtr = SUM(TO_NUMBER(doc.biddedCTR)), split = AVERAGE(TO_NUMBER(doc.split))
              SORT date, TO_NUMBER(subid) DESC 
              RETURN { date: DATE_FORMAT(DATE_ISO8601(date), '%yyyy-%mm-%dd'), subid, clicks,  ctr, cpc: revenue*split/100/clicks, revenue: revenue*split/100, searches }`;
          } else if (advertiser == "rubi") {
            aql = `FOR doc IN rubi_stat_reports FILTER doc.date >= ${start_date} && doc.date <= ${end_date} FOR t IN tags FILTER t.advertiser == "rubi" && t._id == "${tagId}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || (ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%')) || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid, country = doc.geo AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.total_searches)), clicks = SUM(TO_NUMBER(doc.clicks)), monetized_searches = SUM(TO_NUMBER(doc.monetized_searches)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date, TO_NUMBER(subid) DESC RETURN {date: DATE_FORMAT(DATE_ISO8601(date), '%yyyy-%mm-%dd'), subid, revenue: revenue*split/100,country, clicks, cpc: revenue*split/100/clicks, searches, ctr: clicks/searches }`
          } else if (advertiser == "verizon-direct") {
            aql = `FOR doc IN verizon_direct_reports FILTER doc.date >= ${start_date} && doc.date <= ${end_date} FOR t IN tags FILTER t.advertiser == "verizon-direct" && t._id == "${tagId}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || (ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%')) || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid, country =doc.userCountry AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), clicks = SUM(TO_NUMBER(doc.biddedClicks)), biddedSearches = SUM(TO_NUMBER(doc.biddedSearches)), coverage = SUM(TO_NUMBER(doc.coverage)), ctr = SUM(TO_NUMBER(doc.ctr)), cpc = SUM(TO_NUMBER(doc.cpc)), tqScore = SUM(TO_NUMBER(doc.tqScore)), biddedResults = SUM(TO_NUMBER(doc.biddedResults)), rn = SUM(TO_NUMBER(doc.rn)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date, TO_NUMBER(subid) DESC RETURN {date: DATE_FORMAT(DATE_ISO8601(date), '%yyyy-%mm-%dd'), subid, country, revenue: revenue*split/100, clicks, searches, ctr: clicks/searches, cpc: revenue*split/100/clicks }`;

          } else if (advertiser == "solex-bc") {
            aql = `FOR doc IN solexbc_stat_reports FILTER doc.date >= ${start_date} && doc.date <= ${end_date} FOR t IN tags FILTER t.advertiser == "solex-bc" && t._id == "${tagId}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid, country = doc.country AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), clicks = SUM(TO_NUMBER(doc.clicks)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date, TO_NUMBER(subid) DESC RETURN {date: DATE_FORMAT(DATE_ISO8601(date), '%yyyy-%mm-%dd'), subid, country, revenue: revenue*split/100, clicks, ctr: clicks/searches,  cpc: revenue*split/100/clicks, searches }`
          } else if (advertiser == "apptitude") {
            aql = `FOR doc IN monarch_apptitudes FILTER doc.date >= ${start_date} && doc.date <= ${end_date} FOR t IN tags FILTER t.advertiser == "apptitude" && t._id == "${tagId}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid, country = doc.country AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), filtering = SUM(TO_NUMBER(doc.filtering)), clicks = SUM(TO_NUMBER(doc.clicks)), impressions = SUM(TO_NUMBER(doc.adimpressions)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date, TO_NUMBER(subid) DESC RETURN {date: DATE_FORMAT(DATE_ISO8601(date), '%yyyy-%mm-%dd'), subid, country, revenue: revenue*split/100, clicks, ctr: clicks/searches, cpc: revenue*split/100/clicks, searches, filtering }`
          } else if (advertiser == "hopkins") {
            aql = `FOR doc IN hopkin_stat_reports FILTER doc.date >= ${start_date} && doc.date <= ${end_date} FOR t IN tags FILTER t.advertiser == "hopkins" && t._id == "${tagId}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid, country = doc.market AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), clicks = SUM(TO_NUMBER(doc.biddedClicks)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date, TO_NUMBER(subid) DESC RETURN {date: DATE_FORMAT(DATE_ISO8601(date), '%yyyy-%mm-%dd'), subid, country, revenue: revenue*split/100, clicks, ctr: clicks/searches, cpc: revenue*split/100/clicks, searches }`
          } else if (advertiser == "system1") {
            aql = `FOR doc IN system1_stat_reports FILTER doc.date >= ${start_date} && doc.date <= ${end_date} FOR t IN tags FILTER t.advertiser == "system1" && t._id == "${tagId}" FOR ts IN t.subids FILTER (ts.filterTag == 'StartsWith' && STARTS_WITH(doc.subid, ts.subid)) || ts.filterTag == 'EndsWith' && LIKE(doc.subid, ts.subid + '%') || (ts.filterTag == 'Contains' && CONTAINS(doc.subid, ts.subid)) || (ts.filterTag == 'ExactValue' && doc.subid == ts.subid) COLLECT date = doc.date, subid = doc.subid, country = doc.country AGGREGATE revenue = SUM(TO_NUMBER(doc.revenue)), searches = SUM(TO_NUMBER(doc.searches)), clicks = SUM(TO_NUMBER(doc.clicks)), split = AVERAGE(TO_NUMBER(doc.split)) SORT date, TO_NUMBER(subid) DESC RETURN {date: DATE_FORMAT(DATE_ISO8601(date), '%yyyy-%mm-%dd'), subid, country, revenue: revenue*split/100, clicks, ctr: clicks/searches, cpc: revenue*split/100/clicks, searches }`
          } 
          try {
            const cursor = await db.query(aql)
            let result = await cursor.all();
            let perionApi = false;
            let filteringFlag = false;
            for (var resultOne of result) {
              resultOne.cpc = resultOne.cpc ? resultOne.cpc.toFixed(2) : 0.00;
              resultOne.revenue = resultOne.revenue ? resultOne.revenue.toFixed(2) : resultOne.revenue;
              resultOne.ctr = resultOne.ctr ? resultOne.ctr.toFixed(2) : resultOne.ctr;
              if (resultOne.follow_on) {
                resultOne.follow_on = resultOne.follow_on ? resultOne.follow_on.toFixed(2) : resultOne.follow_on;
                if (!perionApi) {
                  perionApi = true;
                }
              } 
              if (resultOne.filtering) {
                resultOne.filtering = resultOne.filtering ? resultOne.filtering.toFixed(2) : resultOne.filtering;
                if (!filteringFlag) {
                  filteringFlag = true;
                }
              }
            }
            if (reportFormat != "csv") {
              return res.status(200).send(result);
            } else {
              let csvFields;
              if (perionApi) {
                csvFields = ["date", "subid", "clicks", "ctr", "cpc", "revenue", "follow_on"];
              } else if (filteringFlag) {
                csvFields = ["date", "subid", "clicks", "ctr", "cpc", "revenue", "filtering"];
              }  else {
                csvFields = ["date", "subid", "clicks", "ctr", "cpc", "revenue"];
              }
              const csvParser = new CsvParser({ csvFields });
              const csvData = csvParser.parse(result);

              res.setHeader("Content-Type", "text/csv");
              res.setHeader("Content-Disposition", "attachment; filename=" + "publisher-" + startDate + "-" + endDate + ".csv");

              return res.status(200).end(csvData);
            }

          } catch (error) {
            console.log(error)
            return res.status(500).send(error.response);
          }


        }
        return res.status(400).send('invalid tagId');
      }
      return res.status(400).send('Oops!, Publisher only can access!');
    } else {
      return res.status(400).send('Invalid tag!');
    }

  }

});

module.exports = router;