const express = require('express');
// const { App } = require('@slack/bolt');

const router = express.Router();

// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN,
//   signingSecret: process.env.SLACK_SIGNING_SECRET,
// });

module.exports = (crowi) => {
  router.get('/', async(req, res) => {

    // TODO: use res.apiv3
    return res.json({
      ok: true,
    });
  });

  return router;
};
