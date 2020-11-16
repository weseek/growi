const express = require('express');

express.response.apiv3Err = jest.fn().mockImplementation(
  function(errors, status = 400, info) {
    this.status(status).json({ errors, info });
  },
);

module.exports = express;
