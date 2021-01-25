const express = require('express');

const axios = require('axios');


const router = express.Router();

module.exports = () => {

  router.get('/contributors', async(req, res) => {
    const growiCloudContributors = await axios.get('https://demo.gc.weseek.co.jp/_api/staffCredit');
    return res.json(growiCloudContributors);
  });

  return router;

};
