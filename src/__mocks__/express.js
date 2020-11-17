const express = require('express');

express.response.apiv3Err = jest.fn().mockImplementation(
  function(errors, status = 400, info) {
    this.status(status).json({ errors, info });
  },
);
express.response.apiv3 = jest.fn().mockImplementation(
  function(obj = {}) {
    this.json({ data: obj });
  },
);

module.exports = express;
