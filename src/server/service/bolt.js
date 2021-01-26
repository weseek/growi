const { EventEmitter } = require('events');
const { App } = require('@slack/bolt');


/**
 * the service class of SlackNotificationService
 */
class BoltService extends EventEmitter {

  getBoltAppInstance() {
    const receiver = new BoltService(process.env.SLACK_SIGNING_SECRET, '/');

    const appInstance = new App({
      token: process.env.SLACK_BOT_TOKEN,
      receiver,
    });

    return appInstance;
  }

}

module.exports = BoltService;
