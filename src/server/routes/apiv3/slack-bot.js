
const express = require('express');

const router = express.Router();


module.exports = (crowi) => {
  const { boltService, boltRecieverService, express } = crowi;

  router.get('/:endpoints', async(req, res) => {


    const expressApp = express;
    const { endpoints } = req.params;

    for (const endpoint of endpoints) {
      expressApp.post(endpoint, boltRecieverService.requestHandler.bind(this));
    }

    const boltApp = boltService.getBoltAppInstance(crowi);

    // TODO: improve event method
    // boltApp.event('message', async({ event, client }) => {
    // Do some slack-specific stuff here
    // await client.chat.postMessage('hogehoge');
    res.send('iii');
    // });
  });


  return router;
};
