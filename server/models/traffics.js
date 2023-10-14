function TrafficsModel(orango) {
    let TrafficsSchema = new orango.Schema({
        date: { type: Date, default: Date.now },
        publisher: {type: String},
        ip: {type: String},
        allowed_searches: {type: Number},
    })
    orango.model('Traffics', TrafficsSchema)
}
module.exports = {
    TrafficsModel
}