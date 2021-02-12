const logger = require('@alias/logger')('growi:service:BoltService');

class BoltReciever {

  init(app) {
    this.bolt = app;
  }

  async requestHandler(req, res) {
    if (this.bolt === undefined) {
      throw new Error('Slack bot is not setup');
    }

    let ackCalled = false;
    const event = {
      body: req.body,
      ack: (response) => {
        if (ackCalled) {
          return null;
        }

        ackCalled = true;

        if (response instanceof Error) {
          throw new Error();
        }
        else if (!response) {
          return;
        }
        else {
          return response;
        }

      },
    };

    await this.bolt.processEvent(event);
  }

}

const { App } = require('@slack/bolt');

class BoltService {

  constructor(crowi) {
    this.crowi = crowi;
    this.receiver = new BoltReciever();

    const token = process.env.SLACK_BOT_TOKEN;
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    if (token != null || signingSecret != null) {
      logger.debug('TwitterStrategy: setup is done');
      this.bolt = new App({
        token,
        signingSecret,
        receiver: this.receiver,
      });
      this.init();
    }
  }

  init() {
    // Example of listening for event
    // See. https://github.com/slackapi/bolt-js#listening-for-events
    // or https://slack.dev/bolt-js/concepts#basic
    this.bolt.command('/growi-bot', async({ command, ack, say }) => { // demo
      await say('Hello');
    });

    // The echo command simply echoes on command
    this.bolt.command('/echo', async({ command, ack, say }) => {
      // Acknowledge command request
      await ack();

      await say(`${command.text}`);
    });
  }

}

module.exports = BoltService;
