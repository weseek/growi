const express = require('express');
const { App, ExpressReceiver } = require('@slack/bolt');

const router = express.Router();
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

module.exports = (crowi) => {

  router.get('/', async(req, res) => {

    const app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      receiver,
    });

    app.event('message', async({ event, client }) => {
      await client.chat.postMessage('...');
    });

    receiver.router.post('/secret-page', (req, res) => {
      res.send('yay!');
    });

    // TODO: use res.apiv3
    return res.json({
      ok: true,
    });
  });


  return router;
};
