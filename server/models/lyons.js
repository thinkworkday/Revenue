function LyonStatReportsModel(orango) {
    let LyonStatReportsSchema = new orango.Schema({
        date: { type: Date, default: Date.now },
        ma: {type: Number},
        subid: { type: String },
        searches: { type: Number },
        biddedSearches: { type: Number },
        clicks: { type: Number },
        biddedCTR: { type: Number },
        ctr: { type: Number },
        split: { type: Number },
        revenue: { type: Number },
        tqScore: { type: Number }
    })
    orango.model('LyonStatReports', LyonStatReportsSchema)
}
module.exports = {
    LyonStatReportsModel
}