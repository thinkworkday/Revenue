function MonarchApptitudeModel(orango) {
    let MonarchApptitudeModelSchema = new orango.Schema({
        date: { type: Date, default: Date.now },
        partner: {type: String},
        formcode: { type: String },
        subid: { type: String },
        country: { type: String },
        clicks: { type: Number },
        searches: { type: Number },
        rsearches: { type: Number },
        filtering: { type: Number },
        revenue: { type: Number },
        adimpressions: { type: Number },
        rpm: { type: Number },
        cpc: { type: Number },
        adctr: { type: Number },
        isfollowon: { type: Number },
        browser: { type: String },
        devicetype: { type: String },
        websitecountry: { type: String },
        split: { type: Number },
    })
    orango.model('MonarchApptitude', MonarchApptitudeModelSchema)
  }
module.exports = {
    MonarchApptitudeModel
}