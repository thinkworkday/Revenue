var express = require('express');
var router = express.Router();
const { auth } = require('../middlewares/auth');
const { Notifications, db, Subnotifications } = require('../services/arango');
var moment = require('moment');
const aql = require('arangojs').aql;

router.post('/new-notification', auth, async function (req, res) {
    // console.log(req.body, req.user);
    const { title, content, role, receivers } = req.body;
    const sender = req.user._id;
    const createdAt = moment.utc().toDate().getTime();
    const currentUserId = req.user._id;
    if (receivers) {
        const subData = JSON.stringify(receivers);
        try {
            const result = await Notifications.insert({ title, content, createdAt }).one();
            const notificationId = result._id;
            let cursor1 = await db.query(`FOR subnoti IN ${subData} INSERT { notificationId: "${notificationId}", sender: "${sender}", receiver: subnoti.id, status: false, createdAt: ${createdAt}, show: "active" } INTO subnotifications RETURN NEW`);
            let results1 = await cursor1.all();
            req.io.emit("notifications", { notifications: results1 });
            return res.send({ status: true });
        } catch (error) {
            return res.status(400).send(error);
        }
    } else {
        try {
            const result = await Notifications.insert({ title, content, createdAt }).one();
            const notificationId = result._id;
            let cursor2 = await db.query(`FOR u IN users FILTER u.role == ${role} && u._id != "${currentUserId}" INSERT { notificationId: "${notificationId}", sender: "${sender}", receiver: u._id, status: false, createdAt: ${createdAt}, show: "active" } INTO subnotifications RETURN NEW`);
            let results2 = await cursor2.all();
            req.io.emit("notifications", { notifications: results2 });
            return res.send({ status: true });
        } catch (error) {
            return res.status(400).send(error);
        }
    }

});

//delete tag 
router.delete('/:_key', async function (req, res, next) {
    try {
        let subId = `subnotifications/${req.params._key}`;
        const cursor = await db.query(`FOR sub IN subnotifications FILTER sub._id == "${subId}" UPDATE sub WITH { show: "deleted" } IN subnotifications`);
        let result = await cursor.all();
        return res.send(result[0]);
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
});

router.get('/super-admin-notifications', auth, async function (req, res) {
    const currentUserId = req.user._id;
    try {
        const cursorSend = await db.query(`FOR su IN subnotifications FILTER su.sender == "${currentUserId}" && su.show == "active" LET a = (FOR a IN users FILTER a._id == su.receiver RETURN a.fullname) LET u = (FOR u IN users FILTER u._id == su.sender RETURN u.fullname) LET c = (FOR c IN notifications FILTER c._id == su.notificationId RETURN c) SORT su.createdAt DESC RETURN { _key: su._key, _id: su._id, title: c[0].title, content: c[0].content, createdAt: c[0].createdAt, receivers: a, sender: u }`);
        const cursorReceive = await db.query(`FOR su IN subnotifications FILTER su.receiver == "${currentUserId}" && su.show == "active" LET a = (FOR a IN users FILTER a._id == su.receiver RETURN a.fullname) LET u = (FOR u IN users FILTER u._id == su.sender RETURN u.fullname) LET c = (FOR c IN notifications FILTER c._id == su.notificationId RETURN c) SORT su.createdAt DESC RETURN { _key: su._key, _id: su._id, title: c[0].title, content: c[0].content, createdAt: c[0].createdAt, receivers: a, sender: LENGTH(u) > 0 ? u : ["system"], status: su.status }`);
        let resultSend = await cursorSend.all();
        let resultReceive = await cursorReceive.all();
        let myResult = resultSend.concat(resultReceive);

        return res.send(myResult);
    } catch (error) {
        return res.status(400).send(error);
    }
});

router.get('/publisher-notifications', auth, async function (req, res) {
    const currentUserId = req.user._id;
    try {
        const cursor = await db.query(`FOR s IN subnotifications FILTER s.receiver == "${currentUserId}" && s.show == "active" LET c = (FOR c IN notifications FILTER c._id == s.notificationId SORT c.createdAt DESC RETURN c) LET a = (FOR a IN users FILTER a._id == s.sender RETURN a.fullname) SORT s.createdAt DESC RETURN { _key: s._key, _id: s._id, title: c[0].title, content: c[0].content, createdAt: c[0].createdAt, sender: a, status: s.status }`)

        let result = await cursor.all()
        return res.send(result);
    } catch (error) {
        return res.status(400).send(error);
    }
});

router.get('/detail/:notificationId', auth, async function (req, res) {
    const { notificationId } = req.params;
    try {
        const receiverId = req.user._id;
        const subnotifyId = `subnotifications/${notificationId}`
        await db.query(`FOR subn IN subnotifications FILTER subn._id == "${subnotifyId}" && subn.receiver == "${receiverId}" UPDATE subn WITH { status: true } IN subnotifications`);
        const cursor = await db.query(`FOR su IN subnotifications FILTER su._id == "${subnotifyId}" LET a = (FOR a IN users FILTER a._id == su.receiver RETURN a.fullname) LET u = (FOR u IN users FILTER u._id == su.sender RETURN u.fullname) LET c = (FOR c IN notifications FILTER c._id == su.notificationId RETURN c) RETURN { _key: su._key, _id: su._id, title: c[0].title, content: c[0].content, createdAt: c[0].createdAt, receivers: a, sender: LENGTH(u) > 0 ? u : ["system"] }`);

        let result = await cursor.all();
        return res.send(result[0]);
    } catch (error) {
        return res.status(400).send(error);
    }
});

module.exports = router;