const { EventEmitter } = require('events');
const { App } = require('@slack/bolt');


/**
 * the service class of SlackNotificationService
 */
class BoltService extends EventEmitter {

  constructor(crowi) {
    super();
    this.boltRecieverService = crowi.boltRecieverService;
  }


  getBoltAppInstance() {
    const { boltRecieverService } = this;

    const receiver = boltRecieverService;

    const appInstance = new App({
      token: process.env.SLACK_BOT_TOKEN,
      receiver,
    });

    return appInstance;
  }

}

module.exports = BoltService;
