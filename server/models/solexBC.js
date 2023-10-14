function SolexbcStatReportsModel(orango) {
    let SolexbcStatReportsSchema = new orango.Schema({
        date: { type: Date, default: Date.now },
        subid: { type: String },
        country: {type: String},
        searches: { type: Number },
        searchesPaid: { type: Number },
        clicks: { type: Number },
        revenue: { type: Number },
        split: {type: Number}
    })
    orango.model('SolexbcStatReports', SolexbcStatReportsSchema)
}
module.exports = {
    SolexbcStatReportsModel
}