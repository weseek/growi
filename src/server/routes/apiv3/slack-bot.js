
const express = require('express');

const router = express.Router();
const ErrorV3 = require('../../models/vo/error-apiv3');

module.exports = (crowi) => {
  this.app = crowi.express;
  const { boltService } = crowi;

  router.post('/', async(req, res) => {
    try {
      const response = await boltService.receiver.requestHandler.bind(boltService.receiver)(req, res);
      if (response !== null) {
        res.send(response);
      }
    }
    catch (err) {
      console.log('catch');
      console.log(err);
      return res.apiv3Err(new ErrorV3(`Error:Slack-Bot:${err}`), 500);
    }
    // for verification request URL on Event Subscriptions
    res.send(req.body);
  });

  return router;
};
