
const express = require('express');

const router = express.Router();
const ErrorV3 = require('../../models/vo/error-apiv3');

module.exports = (crowi) => {
  this.app = crowi.express;
  const { boltService } = crowi;
  const requestHandler = boltService.receiver.requestHandler.bind(boltService.receiver);

  router.post('/', async(req, res) => {
    try {
      const response = await requestHandler(req.body) || null;
      res.send(response);
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3(`Error:Slack-Bot:${err}`), 500);
    }
  });

  return router;
};
