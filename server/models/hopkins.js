function HopkinStatReportsModel(orango) {
    let HopkinStatReportsSchema = new orango.Schema({
        date: { type: Date, default: Date.now },
        market: {type: String},
        currency: { type: String },
        device: { type: String },
        subid: { type: String },
        searches: { type: Number },
        biddedSearches: { type: Number },
        biddedClicks: { type: Number },
        revenue: { type: Number },
        coverage: { type: Number },
        ppc: { type: Number },
        tq: { type: Number },
        sourceTQ: { type: Number },
        split: { type: Number }
    })
    orango.model('HopkinStatReports', HopkinStatReportsSchema)
}
module.exports = {
    HopkinStatReportsModel
}