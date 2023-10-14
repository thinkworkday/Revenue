const express = require('express');
const { db, Keyword } = require('../services/arango');
const router = express.Router();
const moment = require('moment');
const requestIP = require('request-ip');
const { lookup } = require('geoip-lite');
const ipaddr = require('ipaddr.js');

//Get Query Keyword Data
router.get('/', async function (req, res) {
    const { day, page } = req.query;
    const parseDay = parseFloat(day);
    const pagelen = 10000;
    let pageNumber = page && parseFloat(page) != 0 ? parseFloat(page) : 1;
    let offset = pagelen * (pageNumber - 1);
    try {
        let aql;
        let countAql;
        if (parseDay > 0) {
            const sDate = moment().subtract(parseDay, 'days').format('YYYY-MM-DDTHH:mm');
            const eDate = moment().subtract(parseDay - 1, 'days').format('YYYY-MM-DDTHH:mm');
            aql = `FOR k IN keywords FILTER k.createdAt >= "${sDate}" && k.createdAt <= "${eDate}" RETURN { keyword: k.keyword }`;
            // countAql = `FOR k IN keywords FILTER k.createdAt >= "${sDate}" && k.createdAt <= "${eDate}" COLLECT WITH COUNT INTO length RETURN length`;
        } else {
            aql = `FOR k IN keywords RETURN { keyword: k.keyword }`;
            // countAql = `RETURN LENGTH(keywords)`;
        }
        const cursor = await db.query(aql);
        let result = await cursor.all();
        // const countCursor = await db.query(countAql);
        // let resultCount = await countCursor.all();
        return res.status(200).send(result);
        // return res.status(200).send({
        //     total: resultCount[0],
        //     page: pageNumber,
        //     pageCount: Math.ceil(resultCount[0]/pagelen),
        //     data: result
        // });
    } catch (e) {
        console.log(e.message)
        return res.status(500).send(e.message)
    }
});

router.post('/', async function (req, res) {
    let ipAddress = requestIP.getClientIp(req);
    if (ipaddr.isValid(ipAddress)) {
        const addr = ipaddr.parse(ipAddress);
        if (addr.kind() === 'ipv6' && addr.isIPv4MappedAddress()) {
            ipAddress = addr.toIPv4Address().toString();
        }
    }
    let userLocation = lookup(ipAddress);
    if (userLocation['country'] === 'US') {
        console.log(userLocation['country']);
        let data = {
            keyword: req.body.keyword,
        }
        let keywordValue = req.body.keyword;
        try {
            if ((/^[a-zA-Z0-9\w\s]{4,45}$/i).test(keywordValue) && !(/(www|http|youtube|yt|facebook|fb|porn|xnxx|xxx|dick|shit|xham|step)/i).test(keywordValue)) {
                const keyword = await Keyword.insert(data).one();
                return res.status(200).send(keyword);
            } else {
                return res.status(400).send('Bad Request!')
            }
        } catch (error) {
            return res.status(500).send(error.message);
        }
    } else {
        return res.status(400).send({
            "message": "The unallowed Country. Only United State Allowed.",
            "ipAddress": ipAddress,
            "userLocation": userLocation
        });
    }

});

module.exports = router;