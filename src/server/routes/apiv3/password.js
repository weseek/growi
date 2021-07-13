const express = require('express');

const router = express.Router();


module.exports = (crowi) => {

  router.put('/', async(req, res) => {
    return res.apiv3({ hoge: 'hoge' });
  });

  return router;
};
