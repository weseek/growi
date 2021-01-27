const { EventEmitter } = require('events');
const { App } = require('@slack/bolt');


/**
 * the service class of SlackNotificationService
 */
class BoltService extends EventEmitter {

  getBoltAppInstance(crowi) {
    const { boltRecieverService } = crowi;

    const receiver = boltRecieverService;

    const boltAppInstance = new App({
      token: process.env.SLACK_BOT_TOKEN,
      receiver,
    });

    return boltAppInstance;
  }

}

module.exports = BoltService;
