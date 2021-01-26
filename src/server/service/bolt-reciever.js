const { EventEmitter } = require('events');
const { createServer } = require('http');

const express = require('express');

/**
 * the service class of SlackNotificationService
 */
class BoltRecieverService extends EventEmitter {

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

  start(port) {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(port, () => {
          resolve(this.server);
        });
      }
      catch (error) {
        reject(error);
      }
    });
  }

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

  // This is a very simple implementation. Look at the ExpressReceiver source for more detail
  async requestHandler(req, res) {
    let ackCalled = false;
    // Assume parseBody function exists to parse incoming requests
    const parsedReq = parseBody(req);
    const event = {
      body: parsedReq.body,
      // Receivers are responsible for handling acknowledgements
      // `ack` should be prepared to be called multiple times and
      // possibly with `response` as an error
      ack: (response) => {
        if (ackCalled) {
          return;
        }

        if (response instanceof Error) {
          res.status(500).send();
        }
        else if (!response) {
          res.send('');
        }
        else {
          res.send(response);
        }

        ackCalled = true;
      },
    };
    await this.bolt.processEvent(event);
  }

}

module.exports = BoltRecieverService;
