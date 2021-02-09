const express = require('express');

const axios = require('axios');

const router = express.Router();
const { isAfter, addMonths } = require('date-fns');

const contributors = require('../../../client/js/components/StaffCredit/Contributor');

let expiredAt;

module.exports = (crowi) => {

  router.get('/', async(req, res) => {
    const now = new Date();

    const growiCloudUri = await crowi.configManager.getConfig('crowi', 'app:growiCloudUri');
    if (growiCloudUri == null) {
      return res.apiv3({ contributors });
    }
    if (expiredAt == null || isAfter(now, expiredAt)) {
      const url = new URL('_api/staffCredit', growiCloudUri);
      try {
        const gcContributorsRes = await axios.get(url.toString());
        // prevent merge gcContributors to contributors more than once
        if (contributors[1].sectionName !== 'GROWI-cloud') {
          contributors.splice(1, 0, gcContributorsRes.data);
        }
        else {
          contributors.splice(1, 1, gcContributorsRes.data);
        }
        // caching 'expiredAt' for 1 month
        expiredAt = addMonths(now, 1);
      }
      catch (err) {
        return res.apiv3Err(err, 500);
      }
    }
    return res.apiv3({ contributors });
  });

  return router;

};
