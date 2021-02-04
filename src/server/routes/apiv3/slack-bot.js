
const express = require('express');

const router = express.Router();

module.exports = (crowi) => {
  this.app = crowi.express;
  const { boltService } = crowi;

  router.post('/', boltService.receiver.requestHandler.bind(boltService.receiver), (req, res) => {

    // for verification request URL on Event Subscriptions
    res.send(req.body);
  });

  return router;
};
