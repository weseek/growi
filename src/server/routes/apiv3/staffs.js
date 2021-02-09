const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:staffs'); // eslint-disable-line no-unused-vars

const express = require('express');

const axios = require('axios');

const router = express.Router();
const { isAfter, addHours } = require('date-fns');

const contributors = require('../../../../resource/Contributor');

let expiredAt;

module.exports = (crowi) => {

  router.get('/', async(req, res) => {
    const now = new Date();
    const growiCloudUri = await crowi.configManager.getConfig('crowi', 'app:growiCloudUri');

    if (expiredAt == null || isAfter(now, expiredAt) || growiCloudUri != null) {
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
        // caching 'expiredAt' for 1 hour
        expiredAt = addHours(now, 1);
      }
      catch (err) {
        logger.warn('cannot display GROWI.cloud staffcredit');
        return res.apiv3();
      }
    }
    return res.apiv3({ contributors });
  });

  return router;

};
