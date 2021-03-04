
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

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    await requestHandler(req.body);
  });

  return router;
};
