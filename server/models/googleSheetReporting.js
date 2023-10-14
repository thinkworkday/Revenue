function GoogleSheetReportingModel(orango) {
    let GoogleSheetReportingSchema = new orango.Schema({
        sheetName: { type: String },  
        sheetUrl: { type: String }
    })
    orango.model('GoogleSheetReporting', GoogleSheetReportingSchema)
}
module.exports = {
    GoogleSheetReportingModel
}