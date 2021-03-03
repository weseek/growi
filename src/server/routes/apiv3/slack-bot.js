
const express = require('express');

const router = express.Router();
const ErrorV3 = require('../../models/vo/error-apiv3');

module.exports = (crowi) => {
  this.app = crowi.express;
  const { boltService } = crowi;
  const requestHandler = boltService.receiver.requestHandler.bind(boltService.receiver);

  router.post('/', async(req, res) => {
    // for verification request URL on Event Subscriptions
    if (req.body.type === 'url_verification') {
      res.send(req.body);
      return;
    }

    // send response immediately to avoid opelation_timeout error
    res.send();

    try {
      await requestHandler(req.body);
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3(`Error:Slack-Bot:${err}`), 500);
    }
  });

  return router;
};
