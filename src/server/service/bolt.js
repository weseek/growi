const logger = require('@alias/logger')('growi:service:BoltService');
const axios = require('axios');

class BoltReciever {

  init(app) {
    this.bolt = app;
  }

  async requestHandler(req, res) {
    let ackCalled = false;

    // for verification request URL on Event Subscriptions
    if (req.body.challenge && req.body.type) {
      return res.send(req.body);
    }

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

    // payload action. click "Submit" etc.
    if (req.body.payload == null) {
      return;
    }

    const payload = JSON.parse(req.body.payload);
    const { type } = payload;

    if (type === 'view_submission') {
      return axios.post('http://localhost:3000/_api/v3/pages', {
        access_token: 'vu5rtuYMSZsYUx4a2ow4xvssjj+uuh0RFYOi03Jhrm4=',
        path: payload.view.state.values.path.path_input.value,
        body: payload.view.state.values.contents.contents_input.value,
      });
    }
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

    this.bolt.command('/growi', async({
      command, client, body, ack,
    }) => {
      await ack();
      const args = command.text.split(' ');
      const firstArg = args[0];

      switch (firstArg) {
        case 'search':
          this.searchResults(command, args);
          break;

        case 'create':
          this.createModal(command, client, body);
          break;

        default:
          this.notCommand(command);
          break;
      }
    });

  }

  notCommand(command) {
    logger.error('Input first arguments');
    return this.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      blocks: [
        this.generateMarkdownSectionBlock('*コマンドが存在しません。*\n Hint\n `/growi [command] [keyword]`'),
      ],
    });

  }

  async searchResults(command, args) {
    const firstKeyword = args[1];
    if (firstKeyword == null) {
      return this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock('*キーワードを入力してください。*\n Hint\n `/growi search [keyword]`'),
        ],
      });
    }

    // remove leading 'search'.
    args.shift();
    const keywords = args.join(' ');
    const { searchService } = this.crowi;
    const option = { limit: 10 };
    const results = await searchService.searchKeyword(keywords, null, {}, option);

    // no search results
    if (results.data.length === 0) {
      return this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock('*キーワードに該当するページは存在しません。*'),
        ],
      });
    }

    const resultPaths = results.data.map((data) => {
      return data._source.path;
    });

    try {
      await this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock('検索結果 10 件'),
          this.generateMarkdownSectionBlock(`${resultPaths.join('\n')}`),
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '検索結果をこのチャンネルに共有する',
                },
                style: 'primary',
              },
            ],
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
          this.generateMarkdownSectionBlock('*検索に失敗しました。*\n Hint\n `/growi search [keyword]`'),
        ],
      });
    }
  }

  async createModal(command, client, body) {
    try {
      await client.views.open({
        trigger_id: body.trigger_id,

        view: {
          type: 'modal',
          callback_id: 'createPage',
          title: {
            type: 'plain_text',
            text: 'Create Page',
          },
          submit: {
            type: 'plain_text',
            text: 'Submit',
          },
          close: {
            type: 'plain_text',
            text: 'Cancel',
          },
          blocks: [
            this.generateMarkdownSectionBlock('ページを作成します'),
            this.generateInputSectionBlock('path', 'Path', 'path_input', false, '/path'),
            this.generateInputSectionBlock('contents', 'Contents', 'contents_input', true, 'Input with Markdown...'),
          ],
        },
      });
    }
    catch {
      logger.error('Failed to create page.');
      await this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock('*ページ作成に失敗しました。*\n Hint\n `/growi create`'),
        ],
      });
    }
  }

  generateMarkdownSectionBlock(blocks) {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: blocks,
      },
    };
  }

  generateInputSectionBlock(blockId, labelText, actionId, isMultiline, placeholder) {
    return {
      type: 'input',
      block_id: blockId,
      label: {
        type: 'plain_text',
        text: labelText,
      },
      element: {
        type: 'plain_text_input',
        action_id: actionId,
        multiline: isMultiline,
        placeholder: {
          type: 'plain_text',
          text: placeholder,
        },
      },
    };
  }

}

module.exports = BoltService;
