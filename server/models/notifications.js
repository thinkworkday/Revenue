function NotificationsModel(orango) {
    let NotificationsSchema = new orango.Schema({
        title: { type: String },
        content: { type: String },
        createdAt: { type: Date, default: Date.now },
    })
    orango.model('Notifications', NotificationsSchema)
}
module.exports = {
    NotificationsModel
}