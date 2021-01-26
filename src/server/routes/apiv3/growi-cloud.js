const express = require('express');

const axios = require('axios');

const router = express.Router();

module.exports = () => {

  router.get('/growi-cloud', async(res) => {
    const url = new URL('_api/staffCredit', GROWI_CLOUD_URI);
    if (url !== null) {
      const growiCloudContributors = await axios.get(url);
      return res.json(growiCloudContributors);
    }
  });

  return router;

};
