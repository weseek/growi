
class BoltReciever {

  init(app) {
    this.bolt = app;
  }

  async requestHandler(req, res) {
    let ackCalled = false;
    const event = {
      body: req.body,
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

    // for verification request URL on Event Subscriptions
    res.send(req.body);
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
    this.bolt.command('/hoge', async({ command, ack, say }) => { // demo
      await say('fuga');
    });
  }

}

module.exports = BoltService;
