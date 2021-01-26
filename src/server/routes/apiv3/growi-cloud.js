// TODO: check front to see either it can use configmanager or not.
const express = require('express');

const axios = require('axios');

const router = express.Router();

module.exports = (crowi) => {

  router.get('/staff-credit', async(req, res) => {
    const growiCloudUrlBase = await crowi.configManager.getConfig('crowi', 'app:growiCloudUri');
    if (growiCloudUrlBase == null) {
      return res.json({});
    }
    const url = new URL('_api/staffCredit', growiCloudUrlBase);
    const gcRes = await axios.get(url.toString());
    const growiCloudContributors = gcRes.data;
    return res.apiv3(growiCloudContributors);
  });

  return router;

};
