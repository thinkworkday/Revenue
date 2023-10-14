function System1StatReportsModel(orango) {
    let System1StatReportsSchema = new orango.Schema({  
        date: { type: Date, default: Date.now },
        subid: { type: String },
        device: { type: String },
        country: {type: String},
        searches: { type: Number },  
        clicks: { type: Number },
        revenue: { type: Number },
        split: {type: Number}
    })
    orango.model('System1StatReports', System1StatReportsSchema)
}
module.exports = {
    System1StatReportsModel
}