const fs = require('fs');
const {GoogleSpreadsheet} = require('google-spreadsheet');
const creds = require("./client_secret.json");

const JSON_FILE_NAME = 'data.json'
const FILE_PATH = `./data/${JSON_FILE_NAME}`

async function getGooglesheetData() {
    console.log('Loading data form spreadsheet..')
    const doc = new GoogleSpreadsheet("1VwaEq7b-P1-HTdIeaHbfdzt273ydN9g-tVTkolPOprs");//please replace your spreadsheet id.
    // access SpreadSheet
    await doc.useServiceAccountAuth({
        client_email: creds.client_email,
        private_key: creds.private_key,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    console.log('reading sheet rows')
    const sheet = doc.sheetsByIndex[0] //please replace index in according to your spreadsheet number.
    const rows = await sheet.getRows()

    const data = rows.map((row) => {
        return {
            date: row.date,
            adUnitName: row.adUnitName,
            adUnitId: row.adUnitId,
            clicks: row.clicks,
            estimatedNetRevenue: row.estimatedNetRevenue,
            impressions: row.impressions,
            nonBillableSRPVs: row.nonBillableSRPVs,
            rawSRPVs: row.rawSRPVs,
            typeTag: row.typeTag,
            market: row.market,
            deviceType: row.deviceType
        }
    });
    console.log(`Stats Data`, data);
    
    console.log(`Data loaded, generating ${JSON_FILE_NAME} file`)
    writeJsonFile(data)
}

function writeJsonFile(data) {
    fs.writeFile(FILE_PATH, JSON.stringify(data, null, 4), (err) =>  {
        if (err) throw err;
        console.log('Completed!!');
        console.log(`Data saved in ${FILE_PATH} file`);
    });
}

getGooglesheetData()