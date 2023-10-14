var express = require('express');
const http = require('http');
var path = require('path');
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var logger = require('morgan');
var cron = require('node-cron');
const requestIP = require('request-ip');
const { lookup } = require('geoip-lite');
const ipaddr = require('ipaddr.js');
dotenv.config();

//Import Routes
const statsRouter = require('./routes/stats');
const usersRouter = require('./routes/users');
const tagsRouter = require('./routes/tags');
const templatesRouter = require('./routes/templates');
const keywordRouter = require('./routes/keyword');
const companyRouter = require('./routes/companies');
const googlesheetRouter = require('./routes/googlesheet');
const googlesheetReportingRouter = require('./routes/google-sheet-reporting');
const publisherRouter = require('./routes/publisher');
const trafficQueriesRouter = require('./routes/trafficQueries');
const notificationsRouter = require('./routes/notifications');

//Cron Job Function
var cronLyonStatSchedule = require('./routes/stats/cronJobs/lyon-stat-cronjob');
var cronPerionStatSchedule = require('./routes/stats/cronJobs/perion-stat-cronjob');
var cronBrandClickPerionStatSchedule = require('./routes/stats/cronJobs/brandclick-perion-cron');
var cronApexPerionStatSchedule = require('./routes/stats/cronJobs/apex-perion-cron');
var cronA2OPerionStatSchedule = require('./routes/stats/cronJobs/a2o-perion-cron');
var cronPeak8PerionStatSchedule = require('./routes/stats/cronJobs/peak8-perion-cron');
var cronManicPerionStatSchedule = require('./routes/stats/cronJobs/manic-perion-cron');
var cronDigitalPerionStatSchedule = require('./routes/stats/cronJobs/digital-perion-cron');
var cronHopkinYHSStatSchedule = require('./routes/stats/cronJobs/hopkin-yhs-cron');
var cronRubiStatSchedule = require('./routes/stats/cronJobs/rubi-stat-cronjob');
var verizonDirectCronJob = require('./routes/stats/cronJobs/verizon-stat-cronjob');
var verizonDirectBeforeCronJob = require('./routes/stats/cronJobs/verizon-before-stat-cronjob');
var system1CronJob = require('./routes/stats/cronJobs/system1-stat-cronjob');
var solexBCCronJob = require('./routes/stats/cronJobs/solexbc-stat-cronjob');
var cbsBingSchedule = require('./routes/stats/cronJobs/cbs-bing-cronjob');
var cbsYahooSchedule = require('./routes/stats/cronJobs/cbs-yahoo-cronjob');
var monarchApptitudeSchedule = require('./routes/stats/cronJobs/monarch-apptitude-cronjob');

//update Cron Job
var cronLyonSplitSchedule = require('./routes/stats/cronJobs/lyon-split');
var cronPerionSplitSchedule = require('./routes/stats/cronJobs/perion-split');
var cronRubiSplitSchedule = require('./routes/stats/cronJobs/rubi-split');
var cronVerizonSplitSchedule = require('./routes/stats/cronJobs/verizon-split');
var cronSolexSplitSchedule = require('./routes/stats/cronJobs/solex-bc-split');
var cronApptitudeSplitSchedule = require('./routes/stats/cronJobs/apptitude-split');
var cronHopkinSplitSchedule = require('./routes/stats/cronJobs/hopkin-yhs-split');
var cronSystem1SplitSchedule = require('./routes/stats/cronJobs/system1-split');

const { auth } = require('./middlewares/auth');
const { cors } = require('./middlewares/cors');

var port = process.env.PORT || 3000;
var app = express();
const server = http.createServer(app);
// const { Server } = require("socket.io");
const io = require("socket.io")(server, {
  // allowEIO3: true,
  cors: {
    credentials: true,
    origin: [
      'http://localhost:4200',
      'http://34.232.43.97',
    ],
    methods: ["GET", "POST"]
  }
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/', express.static(path.join(__dirname, '/nextsys')));

app.use(cors);
app.get('/', function (req, res) {
  let ipAddress = requestIP.getClientIp(req);

  if (ipaddr.isValid(ipAddress)) {
    const addr = ipaddr.parse(ipAddress);
    if (addr.kind() === 'ipv6' && addr.isIPv4MappedAddress()) {
      ipAddress = addr.toIPv4Address().toString();
    }
  }
  let userLocation = lookup(ipAddress);
  res.status(200).send({
    "status": "NextSys api server is running!",
    "ip": ipAddress,
    "userLocation": userLocation
  });
  res.end(); 
});
app.use((req, res, next) => {
  req.io = io;
  return next();
});
app.use('/users', usersRouter);
app.use('/tags', tagsRouter);
app.use('/companies', companyRouter);
app.use('/googlesheet', googlesheetRouter);
app.use('/google-sheet-reporting', googlesheetReportingRouter);
app.use('/templates', templatesRouter);
app.use('/publisher', publisherRouter);
app.use('/traffic-query', trafficQueriesRouter);
app.use('/notifications', notificationsRouter);
app.use('/keywords', keywordRouter);
//STATS
app.use('/stats', statsRouter);

// Schedule tasks to be run on the server.
//00 00 12 * * 0-6 */1 * * * *
cron.schedule(
  '0 15 * * *',
  cronLyonStatSchedule.lyonStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);
//perion state cron
cron.schedule(
  '1 15 * * *',
  cronPerionStatSchedule.perionStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//brandclick perion state cron
cron.schedule(
  '7 15 * * *',
  cronBrandClickPerionStatSchedule.brandclickPerionStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//Apex perion state cron
cron.schedule(
  '6 15 * * *',
  cronApexPerionStatSchedule.apexPerionStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//a2o perion stat cron
cron.schedule(
  '3 15 * * *',
  cronA2OPerionStatSchedule.a2oPerionStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//peak 8 perion stat cron
cron.schedule(
  '4 15 * * *',
  cronPeak8PerionStatSchedule.peak8PerionStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//Monarch Digital perion stat cron
cron.schedule(
  '5 15 * * *',
  cronDigitalPerionStatSchedule.digitalPerionStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//Manic Traffic perion stat cron
cron.schedule(
  '5 15 * * *',
  cronManicPerionStatSchedule.manicPerionStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//hopkins yhs state cron
cron.schedule(
  '0 6 * * *',
  cronHopkinYHSStatSchedule.hopkinYHSStatCronJob,
  {
    scheduled: true,
    timezone: "America/Los_Angeles"
  }
);

//monarch apptitude state cron
cron.schedule(
  '2 15 * * *',
  monarchApptitudeSchedule.MonarchApptitudeCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//rubi state cron
cron.schedule(
  '0 16 * * *',
  cronRubiStatSchedule.rubiStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//verizon state cron
cron.schedule(
  '10 15 * * *',
  verizonDirectCronJob.verizonDirectCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//verizon before state update cron
cron.schedule(
  '0 2 * * *',
  verizonDirectBeforeCronJob.verizonDirectBeforeCronJob,
  {
    scheduled: true,
    timezone: "America/Los_Angeles"
  }
);

//system1 state cron job
cron.schedule(
  '0 15 * * *',
  system1CronJob.system1StatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//solexbc state cron
cron.schedule(
  '25 15 * * *',
  solexBCCronJob.solexBCStatCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//cbs Bing state cron
cron.schedule(
  '0 5 * * *',
  cbsBingSchedule.cbsBingCronJob,
  {
    scheduled: true,
    timezone: "America/Los_Angeles"
  }
);

//cbs Yahoo state cron
cron.schedule(
  '0 5 * * *',
  cbsYahooSchedule.cbsYahooCronJob,
  {
    scheduled: true,
    timezone: "America/Los_Angeles"
  }
);

//update split cron job
cron.schedule(
  '5 15 * * *',
  cronLyonSplitSchedule.lyonSplitUpdateCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

cron.schedule(
  '0 14 * * *',
  cronHopkinSplitSchedule.hopkinSplitUpdateCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

cron.schedule(
  '6 15 * * *',
  cronSolexSplitSchedule.solexbcSplitUpdateCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

cron.schedule(
  '45 15 * * *',
  cronPerionSplitSchedule.perionSplitUpdateCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

cron.schedule(
  '3 15 * * *',
  cronApptitudeSplitSchedule.apptitudeSplitUpdateCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

cron.schedule(
  '3 16 * * *',
  cronRubiSplitSchedule.rubiSplitUpdateCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

cron.schedule(
  '15 15 * * *',
  cronVerizonSplitSchedule.VerizonSplitUpdateCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

//update split cron job
cron.schedule(
  '15 15 * * *',
  cronSystem1SplitSchedule.system1SplitUpdateCronJob,
  {
    scheduled: true,
    timezone: "Asia/Tel_Aviv"
  }
);

// =================================================================
// start the server ================================================
// =================================================================
server.listen(port, () => console.log(`🏎  API Server up and running at http://localhost:${port}`));
