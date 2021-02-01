
const express = require('express');

const router = express.Router();


module.exports = (crowi) => {
  this.app = crowi.express;
  const { boltService } = crowi;
  const endpoints = ['/'];
  for (const endpoint of endpoints) {
    router.post(endpoint, boltService.receiver.requestHandler.bind(this));
  }

  return router;
};
