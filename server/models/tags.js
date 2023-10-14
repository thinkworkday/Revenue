function TagsModel(orango) {
  let TagsSchema = new orango.Schema({
    name: { type: String },
    nickName: { type: String },
    company: { type: String },
    advertiser: { type: String },
    advertiserProvider: { type: String },
    publisher: { type: String },
    browserStatus: { type: String },
    browser: [],
    deviceTypeStatus: { type: String },
    deviceType: [],
    versionStatus: { type: String },
    version: [],
    countryStatus: { type: String },
    country: [],
    adServerUrl: {type: String},
    statType: {type: String},
    // subid: {type: String},
    // limit: {type: String},
    subids: [],
    rotationType: {type: String},
    tagUrls: [],
    initialURL: {type: String},
    created: { type: Date, default: Date.now },
    released: Date,
  })
  orango.model('Tags', TagsSchema);
}
module.exports = {
  TagsModel
}