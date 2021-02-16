const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:staffs'); // eslint-disable-line no-unused-vars

const express = require('express');

const axios = require('axios');

const router = express.Router();
const { isAfter, addHours } = require('date-fns');

const contributors = require('../../../../resource/Contributor');

let expiredAt;
let contributorsCache = contributors;


module.exports = (crowi) => {

  router.get('/', async(req, res) => {
    const now = new Date();
    const growiCloudUri = await crowi.configManager.getConfig('crowi', 'app:growiCloudUri');

    if (growiCloudUri != null && (expiredAt == null || isAfter(now, expiredAt))) {
      const url = new URL('_api/staffCredit', growiCloudUri);
      const growiContributors = contributors.slice(0, 1);
      const otherContributors = contributors.slice(1);
      try {
        const gcContributorsRes = await axios.get(url.toString());
        const gcContributors = gcContributorsRes.data;
        // caching 'expiredAt' for 1 hour
        expiredAt = addHours(now, 1);
        // caching merged contributors
        contributorsCache = growiContributors.concat(gcContributors, otherContributors);
      }
      catch (err) {
        logger.warn('Getting GROWI.cloud staffcredit is failed');
      }
    }
    return res.apiv3({ contributors: contributorsCache });
  });

  return router;

};
