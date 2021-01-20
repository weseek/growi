const express = require('express');

const router = express.Router();

module.exports = (crowi) => {
  router.get('/', async(req, res) => {

    // TODO: use res.apiv3
    return res.json({
      ok: true,
    });
  });

  return router;
};
