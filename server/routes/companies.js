var express = require('express');
const orango = require('orango')
var router = express.Router();
const { Companies, Tags, Templates, db } = require('../services/arango');
const { auth } = require('../middlewares/auth');
const aql = require('arangojs').aql;
const { InitPerionStatReportsSchema } = require('../models/initPerion');
router.use(auth);

//Saves a new company into the companies collection
router.post('/', async (req, res, next) => {
  const { name, reportingProviders, adServerUrls } = req.body
  let adServerUrlsVal = JSON.stringify(adServerUrls);
  let reportingProvidersVal = JSON.stringify(reportingProviders)
  try {
    const isExist = await Companies.find().where({ name })
    if (isExist && isExist.length) {
      return res.status(400).send('Company already exists.')
    } else {
      var aql = `INSERT { name:"${name}", reportingProviders: ${reportingProvidersVal}, adServerUrls: ${adServerUrlsVal} } INTO companies RETURN NEW`
      const cursor = await db.query(aql)
      let result = await cursor.all()
      //new perion stat collection creating about new company
      let companyName = name.trim().split(" ").map(function (e) { return e.trim().toLowerCase(); });
      db.model(`${companyName.join("")}PerionStatReports`, InitPerionStatReportsSchema)
      return res.status(200).send(result[result.length - 1])
    }
  } catch (error) {
    return res.status(400).send('Error adding company: ' + error)
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const allCompanies = await Companies.find();
    return res.status(200).send(allCompanies);
  } catch (err) {
    return res.status(400).send(err);
  }
})

//Return ONE company 
router.get('/get_company/:company_id', async (req, res, next) => {
  const { company_id } = req.params;
  console.log(company_id)
  const _id = `companies/${company_id}`;
  console.log(_id)
  const company = await Companies.find().where({ _id }).one().limit(1);
  if (company) {
    res.status(200).send(company);
  }
  else {
    res.status(400).send('No company found.');
  }
})

//for security
router.get('/get_company_report/:company_id', async (req, res, next) => {
  const { company_id } = req.params;
  console.log(company_id)
  const _id = `companies/${company_id}`;
  console.log(_id)
  const company = await Companies.find().where({ _id }).one().limit(1);
  if (company) {
    var tempCompany = {};
    tempCompany.name = company.name;
    var tempReport = [];
    company.reportingProviders.map(report => {
      tempReport.push({ reportingProvider: report.reportingProvider });
    });
    tempCompany.reportingProviders = tempReport;
    res.status(200).send(tempCompany);
  }
  else {
    res.status(400).send('No company found.');
  }
})

//get MANY companies
router.get('/get_many_companies', async (req, res, next) => {
  //Get UserCompanies from Query Request/URL string & format into JSON.
  const userCompanies = JSON.parse(req.query.companies);

  let companies = await getManyCompaniesHelper(userCompanies);

  //Check final Companies results
  if (companies) {
    res.status(200).send(companies);

  } else {
    res.status(400).send('No company found.');
  }

})

function getManyCompaniesHelper(userCompanies) {
  //console.log("******** user company ********", userCompanies)
  return new Promise((resolve, reject) => {
    try {
      db.query(aql`
          FOR company in companies
            FOR c in ${userCompanies}
              FILTER company._id ==  c
                RETURN { name: company.name, adServerUrls: company.adServerUrls, reportingProviders: company.reportingProviders, _id: company._id }
          `)
        .then(cursor => {
          return cursor.map(t => {
            return t;
          })
        })
        .then(keys => {
          resolve(keys);
        })
        .catch(err => {
          console.log('Inner catch error...')
          console.log(err);
          reject(err);
        })
    } catch (err) {
      console.log(err)
    }
  });
}

//Update company
router.post('/update/:company_id', auth, async function (req, res, next) {
  const { company_id } = req.params;
  const { name, reportingProviders, adServerUrls } = req.body
  const _id = req.body._id;
  try {
    const company = await Companies.find().where({ _id }).one().limit(1);
    console.log(company)
    const result = await Companies.update({ ...company, name: name, reportingProviders: reportingProviders, adServerUrls: adServerUrls }).where({ _id }).limit(1);
    return res.send(result);
  } catch (error) {
    return res.status(400).send(error);
  }
});

//Delete company
router.post('/delete/:company_id', auth, async function (req, res, next) {
  const { company_id } = req.params;
  const { name } = req.body;
  const _id = req.body._id;
  console.log(_id);
  try {
    console.log('Trying to delete')
    //tags delete
    await Tags.remove().where({ company: _id });
    //tempate delete
    await Templates.remove().where({ company: _id });
    const deletedCompany = await Companies.remove().where({ _id }).one().limit(1);
    await deleteCompaniesFromUserOnCompanyDelete(deletedCompany._id);
    return res.status(200).send(deletedCompany);
  } catch (error) {
    res.status(400).send(error);
  }
});

function deleteCompaniesFromUserOnCompanyDelete(companyId) {
  return new Promise((resolve, reject) => {
    try {
      db.query(aql`
          FOR user in users
              LET newCompanies = (
                REMOVE_VALUE (user.companies, "companies/86485209")
              )
            UPDATE user WITH { companies: newCompanies } IN users
          `)
        .then(cursor => {
          return cursor.map(t => {
            return t;
          })
        })
        .then(keys => {
          console.log(keys)
          resolve(keys);
        })
        .catch(err => {
          console.log('Inner catch error...')
          console.log(err);
          reject(err);
        })
    } catch (err) {
      console.log(err)
    }
  });
}
module.exports = router;
