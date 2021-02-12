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

    const signingSecret = crowi.configManager.getConfig('crowi', 'slackbot:signingSecret');
    const token = crowi.configManager.getConfig('crowi', 'slackbot:token');

    const client = new WebClient(token, { logLevel: LogLevel.DEBUG });
    this.client = client;

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
    this.bolt.command('/growi', async({ command, ack }) => {
      await ack();
      const inputSlack = command.text.split(' ');
      const firstArg = inputSlack[0];
      const secondArg = inputSlack[1];

      let resultPaths;

      if (firstArg === 'search' && secondArg != null) {
        const { searchService } = this.crowi;
        const option = { limit: 10 };
        const searchResults = await searchService.searchKeyword(secondArg, null, {}, option);

        if (searchResults.data.length === 0) {
          return this.client.chat.postEphemeral({
            channel: command.channel_id,
            user: command.user_id,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '*キーワードに該当するページは存在しません。*',
                },
              },
            ],
          });
        }

        resultPaths = searchResults.data.map((data) => {
          return data._source.path;
        });
      }

      try {
        await this.client.chat.postEphemeral({
          channel: command.channel_id,
          user: command.user_id,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*検索結果 10 件*',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `${resultPaths.join('\n')}`,
              },
            },
          ],
        });
      }
      catch {
        logger.error('Failed to get search results.');
        await this.client.chat.postEphemeral({
          channel: command.channel_id,
          user: command.user_id,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*検索に失敗しました。*',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: 'Hint\n /growi search [keyword]',
              },
            },
          ],
        });
      }
    });
  }

}

module.exports = BoltService;
