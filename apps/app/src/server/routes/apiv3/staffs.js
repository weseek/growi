import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:staffs'); // eslint-disable-line no-unused-vars

const express = require('express');

const axios = require('axios');

const router = express.Router();
const { isAfter, addHours } = require('date-fns');

const contributors = require('^/resource/Contributor');

let expiredAt;
const contributorsCache = contributors;
let gcContributors;

// Sorting contributors by this method
const compareFunction = function(a, b) {
  return a.order - b.order;
};

module.exports = (crowi) => {

  router.get('/', async(req, res) => {
    const now = new Date();
    const growiCloudUri = await crowi.configManager.getConfig('crowi', 'app:growiCloudUri');

    if (growiCloudUri != null && (expiredAt == null || isAfter(now, expiredAt))) {
      const url = new URL('_api/staffCredit', growiCloudUri);
      try {
        const gcContributorsRes = await axios.get(url.toString());
        if (gcContributors == null) {
          gcContributors = gcContributorsRes.data;
          // merging contributors
          contributorsCache.push(gcContributors);
        }
        // Change the order of section
        contributorsCache.sort(compareFunction);
        // caching 'expiredAt' for 1 hour
        expiredAt = addHours(now, 1);
      }
      catch (err) {
        logger.warn('Getting GROWI.cloud staffcredit is failed');
      }
    }
    return res.apiv3({ contributors: contributorsCache });
  });

  return router;

};
