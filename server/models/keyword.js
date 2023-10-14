function KeywordModel(orango) {
    let keywordSchema = new orango.Schema({
        keyword: {type: String},
        createdAt: { type: Date, default: Date.now },
    })
    orango.model('Keyword', keywordSchema)
}
module.exports = {
    KeywordModel
}