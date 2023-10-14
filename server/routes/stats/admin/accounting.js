var express = require('express');
var router = express.Router();
const { auth } = require('../../../middlewares/auth');
const accountingFunctions = require('../helpers/accounting-scraper')
var moment = require('moment');
const { db, Companies } = require('../../../services/arango');
const aql = require('arangojs').aql;
var axios = require('axios');

router.use(auth);

//get all rubi stats
router.get('/rubi', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await accountingFunctions.getRubiStats(company, startDate, endDate);
    if (stats) {
        res.status(200).send({ stats: stats })
    }
});

//get all perion stats
router.get('/perion', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await accountingFunctions.getPerionStats(company, startDate, endDate);
    if (stats) {
        res.status(200).send({ stats: stats })
    }
});

//get all lyons stats
router.get('/lyons', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await accountingFunctions.getLyonsStats(company, startDate, endDate);
    if (stats) {
        res.status(200).send({ stats: stats })
    }
});

//get all apptitude stats
router.get('/apptitude', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await accountingFunctions.getApptitudeStats(company, startDate, endDate);
    if (stats) {
        res.status(200).send({ stats: stats })
    }
});

//get all solex BC stats
router.get('/solex-bc', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await accountingFunctions.getSolexBCStats(company, startDate, endDate);
    if (stats) {
        res.status(200).send({ stats: stats })
    }
});

//get all verizon Direct stats
router.get('/verizon-direct', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await accountingFunctions.getVerizonDirectStats(company, startDate, endDate);
    if (stats) {
        res.status(200).send({ stats: stats })
    }
});

//get all system1 stats
router.get('/system1', async (req, res, next) => {
    const { company, startDate, endDate } = req.query;
    let stats = await accountingFunctions.getSystem1Stats(company, startDate, endDate);
    if (stats) {
        res.status(200).send({ stats: stats })
    }
});

module.exports = router;