function SubnotificationsModel(orango) {
    let SubnotificationsSchema = new orango.Schema({
        notificationId: { type: String },
        sender: { type: String },
        receiver: { type: String },
        status: { type: Boolean },
        show: { type: Boolean, allow: ['active', 'deleted'], default: 'active' }, 
        createdAt: { type: Date, default: Date.now },
    })
    orango.model('Subnotifications', SubnotificationsSchema)
}
module.exports = {
    SubnotificationsModel
}