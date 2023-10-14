var express = require('express');
const short = require('short-uuid');
var router = express.Router();
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
const requestIp = require('request-ip');
const { User, Companies, Permissions, db } = require('../services/arango');
const { auth } = require('../middlewares/auth');

const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  PUBLISHER: 3,
  ADVERTISER: 4,
};

/* GET users listing. */
router.get('/', function (req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  res.send({ "ip": requestIp.getClientIp(req) });
});

router.post('/signup', async function (req, res, next) {
  const { password, email, fullname = '', pic } = req.body;
  if (!password || !email) {
    return res.status(403).send('Missing parameters');
  }
  const hash = crypto.createHash('md5').update(password).digest("hex");
  try {
    const isExist = await User.find().where({ email });
    if (isExist && isExist.length) {
      console.log('email already exists')
      return res.status(400).send('Email already exists');
    }
    var apiKey = short.generate();
    const result = await User.insert({ password: hash, email, fullname, role: 4, pic: pic, apiKey: apiKey });
    return res.send(result);
  } catch (error) {
    res.status(400);
    return res.send(error);
  }
});

router.post('/login', async function (req, res, next) {
  const { password, email } = req.body;
  const hash = crypto.createHash('md5').update(password).digest("hex");
  try {
    let isExist = await User.find().where({ password: hash, email }).limit(1);
    if (isExist.length < 1) {
      return res.status(500).send('Username or password is wrong');
    }

    isExist = isExist[0];
    var token = await jwt.sign({
      username: isExist.username,
      email: isExist.email,
      _key: isExist._key,
      _id: isExist._id,
      role: isExist.role,
    }, "abc", {
      expiresIn: 86400 // expires in 24 hours
    });
    console.log('Trying for Amandeep');
    await User.update({ ...isExist, token }).where({ email }).limit(1);
    console.log('Finishing for Amandeep');

    res.status(200).send({ username: isExist.username, role: isExist.role, accessToken: token, apiKey: isExist.apiKey });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/getUserByToken', auth, async function (req, res, next) {
  let isExist = await User.find().where({ email: req.user.email }).limit(1);
  if (isExist.length < 1) {
    return res.status(500).send('Username or password is wrong');
  }
  isExist = isExist[0];
  const { password, token, role, ...rest } = JSON.parse(JSON.stringify(isExist));
  let permission = await Permissions.find().where({ role: role }).limit(1);
  rest.permission = permission
  rest.role = role
  return res.send(rest);
});

//publisher
router.get('/get_publishers', auth, async function (req, res, next) {
  try {
    let aql = `FOR b IN users LET a = (FILTER IS_ARRAY(VALUES(b.tagsId)) FOR x IN VALUES(b.tagsId) FILTER IS_ARRAY(x) FOR y IN x FOR a IN tags FILTER y == a._id RETURN a) LET c = (FOR y IN b.companies FOR c IN companies FILTER y == c._id SORT c.name ASC RETURN c.name) FILTER b.role == 3 SORT b.fullname ASC RETURN {_key: b._key,fullname: b.fullname, email: b.email,role: b.role, apiKey: b.apiKey, tags: a, tagsId: b.tagsId, advertisers: b.advertisers, companies: b.companies, companyname: c}`;
    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.send(result);
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
});

//get admin and publisher
router.get('/get_receiver', auth, async function (req, res) {
  let userId = req.user._id;
  try {
    let aql = `FOR u IN users FILTER u.role != 4 && u._id != "${userId}" SORT u.fullname ASC RETURN { _id: u._id, fullname: u.fullname, role: u.role }`;
    const cursor = await db.query(aql);
    let result = await cursor.all()
    return res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
})

//superadmin
router.get('/get_superadmins', auth, async function (req, res, next) {
  // try {
    let aql = `FOR b IN users LET a = (FILTER IS_ARRAY(VALUES(b.tagsId)) FOR x IN VALUES(b.tagsId) FILTER IS_ARRAY(x) FOR y IN x FOR a IN tags FILTER y == a._id RETURN a) LET c = (FOR y IN b.companies FOR c IN companies FILTER y == c._id SORT c.name ASC RETURN c.name) FILTER b.role == 1 SORT b.fullname ASC RETURN {_key: b._key,fullname: b.fullname, email: b.email,role: b.role, apiKey: b.apiKey, tags: a, tagsId: b.tagsId, advertisers: b.advertisers, companies: b.companies, companyname: c}`;
    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.send(result);
  // } catch (error) {
  //   console.log(error)
  //   res.status(400).send(error);
  // }
});

//admin
router.get('/get_admins', auth, async function (req, res, next) {
  try {
    let aql = `FOR b IN users LET a = (FILTER IS_ARRAY(VALUES(b.tagsId)) FOR x IN VALUES(b.tagsId) FILTER IS_ARRAY(x) FOR y IN x FOR a IN tags FILTER y == a._id RETURN a) LET c = (FOR y IN b.companies FOR c IN companies FILTER y == c._id SORT c.name ASC RETURN c.name) FILTER b.role == 2 SORT b.fullname ASC RETURN {_key: b._key,fullname: b.fullname, email: b.email,role: b.role, apiKey: b.apiKey, tags: a, tagsId: b.tagsId, advertisers: b.advertisers, companies: b.companies, companyname: c}`;
    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.send(result);
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
});

//advertiser
router.get('/get_advertisers', auth, async function (req, res, next) {
  try {
    let aql = `FOR b IN users LET a = (FILTER IS_ARRAY(VALUES(b.tagsId)) FOR x IN VALUES(b.tagsId) FILTER IS_ARRAY(x) FOR y IN x FOR a IN tags FILTER y == a._id RETURN a) LET c = (FOR y IN b.companies FOR c IN companies FILTER y == c._id SORT c.name ASC RETURN c.name) FILTER b.role == 4 SORT b.fullname ASC RETURN {_key: b._key,fullname: b.fullname, email: b.email,role: b.role, apiKey: b.apiKey, tags: a,tagsId: b.tagsId, advertisers: b.advertisers, companies: b.companies, companyname: c}`;
    const cursor = await db.query(aql)
    let result = await cursor.all()
    return res.send(result);
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
});

router.get('/get_user/:user_id', auth, async function (req, res, next) {
  const { user_id } = req.params;
  const companyId = req.query.companyId;
  if (!user_id) {
    return res.status(400).json({
      statusCode: 400,
      errors: { msg: 'Expected user id', errorCode: 'paramsMissing' },
    });
  }

  try {
      let aql = `FOR b IN users 
      FILTER b._key == "${user_id}"
      LET a = (FILTER IS_ARRAY(b.tagsId["${companyId}"]) FOR x IN b.tagsId["${companyId}"] FOR a IN tags FILTER x == a._key return a)
      RETURN {fullname: b.fullname, email: b.email, role: b.role, _key: b._key, tags: a, tagsId: b.tagsId, advertisers: b.advertisers, companies: b.companies, apiKey: b.apiKey }`;
      const cursor = await db.query(aql)
      let result = await cursor.all()
      return res.send(result[0]);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/get_user/:user_id', auth, async function (req, res, next) {
  const { user_id } = req.params;
  let tempTagsId = {};
  const companyId = req.body.company;
  const body = { email: req.body.user.email, fullname: req.body.user.fullname, role: req.body.user.role, companies: req.body.user.companies };
  const _id = `users/${user_id}`;
  const user = await User.find().where({ _id }).one().limit(1);
  tempTagsId = user.tagsId;
  tempTagsId[companyId] = req.body.user.tagsId
  try {
    const updateQuery = {
      ...user,
      ...body
    }
    const result = await User.update(updateQuery).where({ _id }).limit(1);
    res.send(result);
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
});

router.post('/update_password/:user_id', auth, async function (req, res, next) {
  const { user_id } = req.params;
  const { password } = req.body;
  const _id = `users/${user_id}`;
  try {
    const hash = crypto.createHash('md5').update(password).digest("hex");
    const user = await User.find().where({ _id }).limit(1);
    const result = await User.update({ ...user[0], password: hash }).where({ _id }).limit(1);
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/roles', auth, async function (req, res, next) {
  try {
    return res.send(ROLES);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/try', async function (req, res, next) {
  let aql = `FOR b IN users 
  FILTER b._key == "304907"
  LET a = (FOR x IN b.tagsId FOr a IN tags FILTER x == a._key return a) 
  LIMIT 1
  RETURN {fullname: b.fullname, email: b.email,role: b.role, tags: a}`;
  const cursor = await db.query(aql)
  let results = await cursor.all()
  console.log(results)
  res.send(results);
  // convert results from JSON to models
  //console.log(User.fromJSON(results))
});

//Update Permission
router.post('/update/:permission_id', auth, async function (req, res, next) {
  console.log(req.body)
  const { dashboard, notifications, layoutBuilder, protectedMedia, googleMaterial, eCommerce, liveTraffic, ngBootstrap, companyManage, userManage, reportManage, tagManage, publisherReportingManage, apiDocumentationManage } = req.body;
  const _id = req.body._id;
  try {
    const permission = await Permissions.find().where({ _id }).one().limit(1);
    const result = await Permissions.update({ ...permission, dashboard: dashboard, notifications: notifications, layoutBuilder: layoutBuilder, protectedMedia: protectedMedia, googleMaterial: googleMaterial, eCommerce: eCommerce, liveTraffic: liveTraffic, ngBootstrap: ngBootstrap, companyManage: companyManage, userManage: userManage, reportManage: reportManage, tagManage: tagManage, publisherReportingManage: publisherReportingManage, apiDocumentationManage: apiDocumentationManage }).where({ _id });
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

//one permission get 
router.get('/get_permission/:role_id', async function (req, res, next) {
  var { role_id } = req.params;
  var role = parseInt(role_id);
  try {
    let permission = await Permissions.find().where({ role: role }).one().limit(1);
    if (permission) {
      res.status(200).send(permission);
    }
    else {
      res.status(400).send('No Permission found.');
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/new-user', async function (req, res, next) {
  const { password, email, fullname = '', role, companies } = req.body;
  if (!password || !email) {
    res.status(403);
    return res.send('Missing parameters');
  }
  const hash = crypto.createHash('md5').update(password).digest("hex");
  try {
    const isExist = await User.find().where({ email });
    if (isExist && isExist.length) {
      console.log('email already exists')
      return res.send({ data: 'Email already exists', status: false });
    }
    var apiKey = short.generate();
    const result = await User.insert({ password: hash, email, fullname, role: role, companies: companies, apiKey: apiKey }).one();
    return res.send({ data: result.fullname, status: true });
  } catch (error) {
    return res.status(400).send(error);
  }
});

//delete user 
router.delete('/:_key', async function (req, res, next) {
  try {
    let result = await User.remove().where({ _key: req.params._key });
    return res.send(result);
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
});


module.exports = router;
