
const express = require('express');

const router = express.Router();


module.exports = (crowi) => {

  router.get('/', async(req, res) => {

    // TODO: improve event method
    // app.event('message', async({ event, client }) => {
    //   // Do some slack-specific stuff here
    //   await client.chat.postMessage('hogehoge');
    // });

    // (async() => {
    //   await app.start(8080);
    //   console.log('app is running');
    // })();
  });


  return router;
};
