function TrafficQueriesModel(orango) {
    let TrafficQueriesSchema = new orango.Schema({
        query: { type: String },
        ip: {type: String},
    })
    orango.model('TrafficQueries', TrafficQueriesSchema)
}
module.exports = {
    TrafficQueriesModel
}