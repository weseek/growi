const express = require('express');
const { App, ExpressReceiver } = require('@slack/bolt');

const router = express.Router();
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

module.exports = (crowi) => {

  router.get('/', async(req, res) => {
  });

  const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver,
  });

  console.log('bbb');

  app.message('あ', async({ message, say }) => {
    await say('aaaaaa');
  });
  console.log('ccc');

  return router;
};
