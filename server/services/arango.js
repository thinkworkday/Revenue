const orango = require('orango')
const { UserModel } = require('../models/user');
const { TagsModel } = require('../models/tags');
const { CompaniesModel } = require('../models/companies');
const { PermissionsModel } = require('../models/permissions');
const { TemplatesModel } = require('../models/templates');
const { LyonStatReportsModel } = require('../models/lyons');
const { HopkinStatReportsModel } = require('../models/hopkins');
const { PerionStatReportsModel } = require('../models/perions');
const { RubiStatReportsModel } = require('../models/rubies');
const { VerizonDirectsModel } = require('../models/verizonDirect');
const { System1StatReportsModel } = require('../models/system1');
const { TrafficQueriesModel } = require('../models/trafficQueries');
const { TrafficsModel } = require('../models/traffics');
const { SolexbcStatReportsModel } = require('../models/solexBC');
const { MonarchApptitudeModel } = require('../models/monarch-apptitude');
const { KeywordModel } = require('../models/keyword');
const { NotificationsModel } = require('../models/notifications');
const { SubnotificationsModel } = require('../models/subnotifications');
const { GoogleSheetReportingModel } = require('../models/googleSheetReporting');

const { EVENTS } = orango.consts
const db = orango.get("nextsys")

// we are connected, but orango has not initialized the models
db.events.once(EVENTS.CONNECTED, conn => {
  console.log('🥑  Connected to ArangoDB:', conn.url + '/' + conn.name)
})

// everything is initialized and we are ready to go
db.events.once(EVENTS.READY, () => {
  console.log('🍊  Orango is ready!')
})

async function main() {
  try {
    UserModel(db);
    TagsModel(db);
    CompaniesModel(db);
    PermissionsModel(db);
    TemplatesModel(db);
    LyonStatReportsModel(db);
    HopkinStatReportsModel(db);
    PerionStatReportsModel(db);
    RubiStatReportsModel(db);
    VerizonDirectsModel(db);
    System1StatReportsModel(db);
    TrafficQueriesModel(db);
    TrafficsModel(db);
    SolexbcStatReportsModel(db);
    MonarchApptitudeModel(db);
    NotificationsModel(db);
    SubnotificationsModel(db);
    KeywordModel(db);
    GoogleSheetReportingModel(db);

    await db.connect(
      {
        // url: process.env.DB_HOST,
        // username: process.env.DB_USERNAME,
        // password: process.env.DB_PASSWORD,
        url: "http://localhost:8529",
        username: "root",
        password: "root",
      }
    );
    // everything is initialized and we are ready to go
    console.log('Are we connected?', db.connection.connected) // true
    //db.createCollection("actors")

  } catch (e) {
    console.log(e)
    console.log('Error:', e.message)
  }
}

main()

module.exports = {
  User: db.model('User'),
  Tags: db.model('Tags'),
  Companies: db.model('Companies'),
  Permissions: db.model('Permissions'),
  Templates: db.model('Templates'),
  Keyword: db.model('Keyword'),
  LyonStatReports: db.model('LyonStatReports'),
  PerionStatReports: db.model('PerionStatReports'),
  RubiStatReports: db.model('RubiStatReports'),
  VerizonDirectReports: db.model('VerizonDirectReports'),
  System1StatReports: db.model('System1StatReports'),
  TrafficQueries: db.model('TrafficQueries'),
  Traffics: db.model('Traffics'),
  SolexbcStatReports: db.model('SolexbcStatReports'),
  MonarchApptitude: db.model('MonarchApptitude'),
  Notifications: db.model('Notifications'),
  Subnotifications: db.model('Subnotifications'),
  GoogleSheetReporting: db.model('GoogleSheetReporting'),
  db,
}