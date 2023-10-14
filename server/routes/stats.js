var express = require('express');
var router = express.Router();
const { auth } = require('../middlewares/auth');

//Additional Stat Routes
var perionRouter = require('./stats/admin/perion');
var lyonRouter = require('./stats/admin/lyon');
var manualUpdateRouter = require('./stats/admin/manual-update');
var rubiRouter = require('./stats/admin/rubi');
var verizonRouter = require('./stats/admin/verizon');
var system1Router = require('./stats/admin/system1');
var solexbcRouter = require('./stats/admin/solexbc');
var cbsBingRouter = require('./stats/admin/cbs-bing');
var apptitudeRouter = require('./stats/admin/monarch-apptitude');
var accountingRouter = require('./stats/admin/accounting');
var hopkinsRouter = require('./stats/admin/hopkins-yhs');

router.use(auth);

//ADMIN STATS
router.use('/admin/perion', perionRouter);
router.use('/admin/lyon', lyonRouter);
router.use('/admin/manual-update', manualUpdateRouter);
router.use('/admin/rubi', rubiRouter);
router.use('/admin/verizon', verizonRouter);
router.use('/admin/system1', system1Router);
router.use('/admin/solexbc', solexbcRouter);
router.use('/admin/cbsbing', cbsBingRouter);
router.use('/admin/apptitude', apptitudeRouter);
router.use('/admin/accounting', accountingRouter);
router.use('/admin/hopkins', hopkinsRouter);

module.exports = router;

