const logger = require('@alias/logger')('growi:service:BoltService');

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
const { WebClient, LogLevel } = require('@slack/web-api');

class BoltService {

  constructor(crowi) {
    this.crowi = crowi;
    this.receiver = new BoltReciever();

    const token = process.env.SLACK_BOT_TOKEN;
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    const client = new WebClient(token, { logLevel: LogLevel.DEBUG });
    const channelId = 'C01JZJP1J58';
    const userId = 'U015018DXL3';

    this.client = client;
    this.channelId = channelId;
    this.userId = userId;

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


    // TODO check if firstArg is the supported command(like "search")
    this.bolt.command('/growi', async({ command }) => {
      const inputSlack = command.text.split(' ');
      const firstArg = inputSlack[0];
      const secondArg = inputSlack[1];

      let searchResults;
      if (firstArg === 'search') {
        const { searchService } = this.crowi;
        const option = { limit: 10 };
        searchResults = await searchService.searchKeyword(secondArg, null, {}, option);
      }

      // TODO impl try-catch
      try {
        const result = await this.client.chat.postEphemeral({
          channel: this.channelId,
          user: this.userId,
          text: searchResults,
        });
        console.log(result);
      }
      catch {
        console.log('errorだよ');
      }
    });
  }


}

module.exports = BoltService;
