function VerizonDirectsModel(orango) {
    let VerizonDirectReportsSchema = new orango.Schema({ 
        date: { type: Date, default: Date.now },
        sourceTag: {type: String},
        userCountry: {type: String},
        subid: { type: String },  
        searches: { type: String },
        biddedSearches: { type: String },
        biddedResults: { type: String },
        biddedClicks: { type: String },
        revenue: { type: String },
        coverage: { type: String },
        ctr: { type: String },
        cpc: { type: String },
        tqScore: { type: String },
        rn: { type: String },  
        split: { type: Number },
    })
    orango.model('VerizonDirectReports', VerizonDirectReportsSchema)
}
module.exports = {
    VerizonDirectsModel
}