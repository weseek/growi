
const express = require('express');

const router = express.Router();


module.exports = (crowi) => {
  const { boltService, boltRecieverService } = crowi;

  router.post('/hoge', boltRecieverService.requestHandler.bind(this), async(req, res) => {

    const boltApp = boltService.getBoltAppInstance(crowi);

    // TODO: improve event method
    boltApp.event('message', async({ event, client }) => {
    // Do some slack-specific stuff here
      await client.chat.postMessage('hogehoge');
      res.send('iii');
    });
  });


  return router;
};
