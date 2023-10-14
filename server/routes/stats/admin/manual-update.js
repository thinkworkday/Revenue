var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const manualUpdateFunctions = require('../helpers/manual-update-scraper');
var axios = require('axios');
var moment = require('moment');
const { Tags } = require('../../../services/arango')

router.use(auth);

//Maunal Update Stat
router.put('/stat-update', async (req, res, next) => {
    const { company, reportType, startDate, endDate } = req.body;
    const currentUserRole = req.user.role;
    let stats;
    if (reportType == "perion") {
        stats = await manualUpdateFunctions.getRawPerionStats(company, startDate, endDate);
        if (stats.length > 0) {
            manualUpdateFunctions.updatePerionDocuments(company, stats);
            res.status(200).send({ stats: "ok" });
        } else {
            if (currentUserRole == 1) {
                res.status(200).send({ stats: "warn" });
            } else {
                res.status(200).send({ stats: "ok" });
            }
        }
    } else if (reportType == "lyons") {
        stats = await manualUpdateFunctions.getRawLyonsStats(company, startDate, endDate);
        if (stats.length > 0) {
            manualUpdateFunctions.updateLyonStats(company, stats);
            res.status(200).send({ stats: "ok" });
        } else {
            if (currentUserRole == 1) {
                res.status(200).send({ stats: "warn" });
            } else {
                res.status(200).send({ stats: "ok" });
            }
        }
    } else if (reportType == "rubi") {
        stats = await manualUpdateFunctions.getRawRubiStats(company, startDate, endDate);
        if (stats.length > 0) {
            manualUpdateFunctions.updateRubiStats(company, stats);
            res.status(200).send({ stats: "ok" });
        } else {
            if (currentUserRole == 1) {
                res.status(200).send({ stats: "warn" });
            } else {
                res.status(200).send({ stats: "ok" });
            }
        }
    } else if (reportType == "verizon-direct") {
        //stats = await manualUpdateFunctions.getRawVerizonDirectStats(company, startDate, endDate);
        manualUpdateFunctions.updateVerizonStats(company, startDate, endDate);
        res.status(200).send({ stats: "ok" });
    } else if (reportType == "solex-bc") {
        stats = await manualUpdateFunctions.getRawSolexBCStats(company, startDate, endDate);
        if (stats.length > 0) {
            manualUpdateFunctions.updateSolexBCStats(company, stats);
            res.status(200).send({ stats: "ok" });
        } else {
            if (currentUserRole == 1) {
                res.status(200).send({ stats: "warn" });
            } else {
                res.status(200).send({ stats: "ok" });
            }
        }
        
    } else if (reportType == "apptitude") {
        stats = await manualUpdateFunctions.getRawApptitudeStats(company, startDate, endDate);
        if (stats.length > 0) {
            manualUpdateFunctions.updateApptitudeStats(company, stats);
            res.status(200).send({ stats: "ok" });
        } else {
            if (currentUserRole == 1) {
                res.status(200).send({ stats: "warn" });
            } else {
                res.status(200).send({ stats: "ok" });
            }
        }
        
    } else if (reportType == "hopkins") {
        stats = await manualUpdateFunctions.getRawHopkinStats(company, startDate, endDate);
        if (stats.length > 0) {
            manualUpdateFunctions.updateHopkinStats(company, stats);
            res.status(200).send({ stats: "ok" });
        } else {
            if (currentUserRole == 1) {
                res.status(200).send({ stats: "warn" });
            } else {
                res.status(200).send({ stats: "ok" });
            }
        }
        
    }
});

//Maunal Update Split
router.put('/split-update', async (req, res, next) => {
    const { company, reportType, tag, startDate, endDate } = req.body;
    console.log('REPORT MANUAL UPDATING SPLIT...', company, reportType, tag, startDate, endDate)
    if (reportType == "perion") {
        //Perion Split Change
        manualUpdateFunctions.updatePerionSplits(company, tag, startDate, endDate);
        console.log(`Completed Perion Split Updating!`)
    } else if (reportType == "lyons") {
        //Lyons Split Change
        manualUpdateFunctions.updateLyonsSplits(company, tag, startDate, endDate);
        console.log(`Completed Lyons Split Updating!`)
    } else if (reportType == "rubi") {
        //Rubi Split Change
        manualUpdateFunctions.updateRubiSplits(company, tag, startDate, endDate);
        console.log(`Completed Rubi Split Updating!`)
    } else if (reportType == "verizon-direct") {
        //Verizon Split Change
        manualUpdateFunctions.updateVerizonSplits(company, tag, startDate, endDate);
        console.log(`Completed Version Direct Split Updating!`)
    } else if (reportType == "solex-bc") {
        //SolexBc Split Change
        manualUpdateFunctions.updateSolexbcSplits(company, tag, startDate, endDate);
        console.log(`Completed Solex BC Split Updating!`)
    } else if (reportType == "apptitude") {
        //Apptitude Split Change
        manualUpdateFunctions.updateApptitudeSplits(company, tag, startDate, endDate);
        console.log(`Completed Apptitude Split Updating!`)
    } else if (reportType == "hopkins") {
        //Hopkins YHS Split Change
        manualUpdateFunctions.updateHopkinSplits(company, tag, startDate, endDate);
        console.log(`Completed Hopkins YHS Split Updating!`)
    } else if (reportType == "system1") {
        //System1 Split Change
        manualUpdateFunctions.updateSystem1Splits(company, tag, startDate, endDate);
        console.log(`Completed System1 Split Updating!`)
    }


    res.status(200).send({ stats: "ok" });
});

module.exports = router;