const express = require('express');

const axios = require('axios');

const router = express.Router();

module.exports = (crowi) => {

  router.get('/staff-credit', async(req, res) => {
    const growiCloudUri = await crowi.configManager.getConfig('crowi', 'app:growiCloudUri');
    if (growiCloudUri == null) {
      return res.json({});
    }
    const url = new URL('_api/staffCredit', growiCloudUri);
    const gcContributorsRes = await axios.get(url.toString());
    return res.apiv3(gcContributorsRes.data);
  });

  return router;

};
