
const express = require('express');

const router = express.Router();


module.exports = (crowi) => {
  this.app = crowi.express;
  const { boltService } = crowi;
  const endpoints = ['/hogehoge'];
  for (const endpoint of endpoints) {
    this.app.post(endpoint, boltService.receiver.requestHandler.bind(this));
  }
  // boltService.receiver.addRoutes(['/hoge']);
  // router.post('/', async(req, res) => {

  // // const boltApp = boltService.getBoltAppInstance(crowi);

  // // // TODO: improve event method
  // // boltApp.event('message', async({ event, client }) => {
  // // // Do some slack-specific stuff here
  // //   await client.chat.postMessage('hogehoge');
  // //   res.send('iii');
  // // });
  // });


  return router;
};
