
const { EventEmitter } = require('events');
const { createServer } = require('http');
const express = require('express');

const { App, ExpressReceiver } = require('@slack/bolt');

const router = express.Router();
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

module.exports = (crowi) => {

  router.get('/', async(req, res) => {

    class simpleReceiver extends EventEmitter {

      constructor(signingSecret, endpoints) {
        super();
        this.app = express();
        this.server = createServer(this.app);

        for (const endpoint of endpoints) {
          this.app.post(endpoint, this.requestHandler.bind(this));
        }
      }

      init(app) {
        this.bolt = app;
      }

      // start(port) {
      //   return new Promise((resolve, reject) => {
      //     try {
      //       this.server.listen(port, () => {
      //         resolve(this.server);
      //       });
      //     }
      //     catch (error) {
      //       reject(error);
      //     }
      //   });
      // }

      stop() {
        return new Promise((resolve, reject) => {
          this.server.close((error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        });
      }

    }

    res.send('iii');

    const app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      receiver,
    });

    // app.post('/postMessage', async(req, res) => {
    //   res.send('iii');
    // });

    // app.event('message', async({ event, client }) => {
    //   // Do some slack-specific stuff here
    //   await client.chat.postMessage({
    //     channel: 'growi_bot',
    //     text: 'hiiii',
    //   });
    // });
  });


  return router;
};
