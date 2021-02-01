const express = require('express');

const axios = require('axios');

const router = express.Router();

const contributors = require('../../../client/js/components/StaffCredit/Contributor');

module.exports = (crowi) => {

  router.get('/', async(req, res) => {
    const growiCloudUri = await crowi.configManager.getConfig('crowi', 'app:growiCloudUri');
    if (growiCloudUri == null) {
      return res.json({});
    }
    const url = new URL('_api/staffCredit', growiCloudUri);
    try {
      const gcContributorsRes = await axios.get(url.toString());
      // prevent merge gcContributors to contributors more than once
      if (contributors[1].sectionName !== 'GROWI-cloud') {
        contributors.splice(1, 0, gcContributorsRes.data);
      }
      return res.apiv3({ contributors });
    }
    catch (err) {
      return res.apiv3Err(err, 500);
    }
  });

  return router;

};
