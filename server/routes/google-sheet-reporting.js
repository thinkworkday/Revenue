var express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require("../client_secret.json");
const { GoogleSheetReporting, db } = require('../services/arango');
const { auth } = require('../middlewares/auth');
const moment = require('moment');
var router = express.Router();

// router.use(auth);

router.post('/create', async (req, res) => {
    const { sheetName, sheetUrl } = req.body;
    const isValid = await isValidGoogleSheetUrl(sheetUrl);
    if (!isValid.status) {
        return res.send(isValid.message);
    }
    try {
        const isExistSheet = await GoogleSheetReporting.find().where({ sheetName: sheetName });
        if (isExistSheet && isExistSheet.length) {
            return res.status(400).send('Sheet already exists');
        }
        const result = await GoogleSheetReporting.insert({ sheetName: sheetName, sheetUrl: sheetUrl });
        return res.send(result);
    } catch (error) {
        res.status(400);
        return res.send(error);
    }
});

router.get('/all-sheets', async (req, res) => {
    try {
        const sheets = await GoogleSheetReporting.find();
        return res.send(sheets);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.get('/get-sheet/:sheetId', async (req, res) => {
    const { sheetId } = req.params;
    const _id = `google_sheet_reportings/${sheetId}`;
    console.log(_id)
    try {
        const sheet = await GoogleSheetReporting.find().where({ _id }).one().limit(1);
        if (sheet) {
            return res.status(200).send(sheet);
        }
        else {
            return res.status(400).send('No sheet found.');
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }

});

//Update Sheet
router.put('/update/:sheetId', auth, async function (req, res, next) {
    const { sheetId } = req.params;
    const { sheetName, sheetUrl } = req.body;
    const _id = `google_sheet_reportings/${sheetId}`;
    try {
        const sheet = await GoogleSheetReporting.find().where({ _id }).one().limit(1);
        const result = await GoogleSheetReporting.update({ ...sheet, sheetName: sheetName, sheetUrl: sheetUrl }).where({ _id }).limit(1);
        return res.send(result);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/googlesheet-data/:sheetId', async (req, res) => {
    const { sheetId } = req.params;
    const { startDate, endDate } = req.query;
    const _id = `google_sheet_reportings/${sheetId}`;
    try {
        const sheet = await GoogleSheetReporting.find().where({ _id }).one().limit(1);
        const parts = sheet.sheetUrl.split('/');
        const googlesheetId = parts[parts.length - 2];
        if (googlesheetId) {
            console.log('Loading data form spreadsheet..');
            try {
                const doc = new GoogleSpreadsheet(googlesheetId);
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
                    const sDate = moment.utc(startDate, "MM-DD-YYYY").startOf('day').toDate().getTime();
                    const eDate = moment.utc(endDate, "MM-DD-YYYY").endOf('day').toDate().getTime();

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
            return res.status(404).send('Please provide the correct googlesheet ID.')
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

async function isValidGoogleSheetUrl(url) {
    // Check if the URL matches the pattern of a Google Sheets URL
    const urlRegex = /^https:\/\/docs\.google\.com\/spreadsheets\/.+$/;
    if (!urlRegex.test(url)) {
        return { status: false, message: 'Invalid Google Sheet URL.' };
    }

    // Extract the spreadsheet ID from the URL
    const parts = url.split('/');
    const sheetId = parts[parts.length - 2];

    // Use the google-spreadsheet package to try to load the spreadsheet
    const doc = new GoogleSpreadsheet(sheetId);
    try {
        await doc.useServiceAccountAuth({
            client_email: creds.client_email,
            private_key: creds.private_key,
        });
        await doc.loadInfo();
        return { status: true, message: 'Valid Google Sheet URL.' };
    } catch (err) {
        console.error(err.message);
        return { status: false, message: err.message };
    }
}

module.exports = router;