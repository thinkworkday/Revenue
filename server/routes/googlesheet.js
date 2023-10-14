var express = require('express');
var router = express.Router();
const moment = require('moment');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require("../client_secret.json");

router.get('/:sheetId/stats', async function (req, res) {
    const sheetId = req.params.sheetId;
    const { startDate, endDate } = req.query;
    if (sheetId) {
        console.log('Loading data form spreadsheet..');
        try {
            const doc = new GoogleSpreadsheet(sheetId);
            await doc.useServiceAccountAuth({
                client_email: creds.client_email,
                private_key: creds.private_key,
            });
            await doc.loadInfo(); // loads document properties and worksheets
            console.log('reading sheet rows')
            const sheet = doc.sheetsByTitle['Raw'] //please replace index in according to your spreadsheet number.
            const rows = await sheet.getRows()
            let data = [];
            if (startDate && endDate) {
                const sDate = moment.utc(startDate, "MM/DD/YYYY").startOf('day').toDate().getTime();
                const eDate = moment.utc(endDate, "MM/DD/YYYY").endOf('day').toDate().getTime();

                const sDateVaild = moment.utc(startDate, "MM/DD/YYYY", true).isValid();
                const eDateVaild = moment.utc(endDate, "MM/DD/YYYY", true).isValid();

                if (!sDateVaild || !eDateVaild) {
                    return res.send("The DateFormat has to be 'MM/DD/YYYY'.");
                }
                for (var k = 0; k < rows.length; k++) {
                    if (rows[k].Searches != '' && rows[k].Clicks != '') {
                        const comDate = moment.utc(rows[k].Date, "M/D/YY").startOf('day').toDate().getTime();
                        if (comDate >= sDate && comDate <= eDate) {
                            let stat = {
                                date: rows[k].Date,
                                searches: rows[k].Searches,
                                clicks: rows[k].Clicks,
                                ctr: rows[k].CTR,
                                revenue: rows[k].Revenue,
                                rpc: rows[k].RPC,
                                tq: rows[k].TQ,
                            }
                            data.push(stat);
                        }
                    }
                }  
            } else {
                for (var k = 0; k < rows.length; k++) {
                    if (rows[k].Searches != '' && rows[k].Clicks != '') {
                        let stat = {
                            date: rows[k].Date,
                            searches: rows[k].Searches,
                            clicks: rows[k].Clicks,
                            ctr: rows[k].CTR,
                            revenue: rows[k].Revenue,
                            rpc: rows[k].RPC,
                            tq: rows[k].TQ,
                        }
                        data.push(stat);
                    }
                }  
            }
            
            return res.send(data);
        } catch (error) {
            console.log(error)
            return res.status(500).send(error)
        }

    } else {
        return res.status(404).send('Please provide the correct sheet ID.')
    }
});

module.exports = router;