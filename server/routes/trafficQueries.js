var express = require('express');
var axios = require('axios');
var router = express.Router();
const { db } = require('../services/arango');
const { auth } = require('../middlewares/auth');
const aql = require('arangojs').aql;

router.use(auth);

//get all traffic queries
router.get('/', async function (req, res, next) {
  try {
    let aql = `FOR tq IN traffic_queries RETURN { query: tq.query, ip: tq.ip }`;
    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;