const logger = require('@alias/logger')('growi:service:BoltService');

class BoltReciever {

  init(app) {
    this.bolt = app;
  }

  async requestHandler(body) {
    if (this.bolt === undefined) {
      throw new Error('Slack Bot service is not setup');
    }

    let ackCalled = false;

    // for verification request URL on Event Subscriptions
    if (body.type === 'url_verification') {
      return body;
    }

    const payload = body.payload;
    let reqBody;

    if (payload != null) {
      reqBody = JSON.parse(payload);
    }
    else {
      reqBody = body;
    }

    const event = {
      body: reqBody,
      ack: (response) => {
        if (ackCalled) {
          return null;
        }

        ackCalled = true;

        if (response instanceof Error) {
          const message = response.message || 'Error occurred';
          throw new Error(message);
        }
        else if (!response) {
          return null;
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
      logger.debug('SlackBot: setup is done');
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
          await this.searchResults(command, args);
          break;

        case 'create':
          await this.createModal(command, client, body);
          break;

        default:
          this.notCommand(command);
          break;
      }
    });

    this.bolt.view('createPage', async({
      ack, view, body, client,
    }) => {
      await ack();
      await this.createPageInGrowi(view, body);
    });

    this.bolt.action('button_click', async({ body, ack, say }) => {
      await ack();
      await say('clicked the button');
    });

  }

  notCommand(command) {
    logger.error('Invalid first argument');
    this.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      blocks: [
        this.generateMarkdownSectionBlock('*No command.*\n Hint\n `/growi [command] [keyword]`'),
      ],
    });
    throw new Error('/growi command: Invalid first argument');
  }

  async searchResults(command, args) {
    const firstKeyword = args[1];
    if (firstKeyword == null) {
      this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock('*Input keywords.*\n Hint\n `/growi search [keyword]`'),
        ],
      });
      throw new Error('/growi command:search: Invalid keyword');
    }

    // remove leading 'search'.
    args.shift();
    const keywords = args.join(' ');
    const { searchService } = this.crowi;
    const option = { limit: 10 };
    const results = await searchService.searchKeyword(keywords, null, {}, option);

    // no search results
    if (results.data.length === 0) {
      logger.info(`No page found with "${keywords}"`);
      this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [this.generateMarkdownSectionBlock('*No page that match your keywords.*')],
      });
      return;
    }

    const resultPaths = results.data.map((data) => {
      return data._source.path;
    });

    try {
      await this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock('10 results.'),
          this.generateMarkdownSectionBlock(`${resultPaths.join('\n')}`),
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Share the results in this channel.',
                },
                style: 'primary',
                action_id: 'button_click',
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
          this.generateMarkdownSectionBlock('*Failed to search.*\n Hint\n `/growi search [keyword]`'),
        ],
      });
      throw new Error('/growi command:search: Failed to search');
    }
  }

  async createModal(command, client, body) {
    const User = this.crowi.model('User');
    const slackUser = await User.findUserByUsername('slackUser');

    // if "slackUser" is null, don't show create Modal
    if (slackUser == null) {
      logger.error('Failed to create a page because slackUser is not found.');
      this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [this.generateMarkdownSectionBlock('*slackUser does not exist.*')],
      });
      throw new Error('/growi command:create: slackUser is not found');
    }

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
            this.generateMarkdownSectionBlock('Create new page.'),
            this.generateInputSectionBlock('path', 'Path', 'path_input', false, '/path'),
            this.generateInputSectionBlock('contents', 'Contents', 'contents_input', true, 'Input with Markdown...'),
          ],
        },
      });
    }
    catch (err) {
      logger.error('Failed to create a page.');
      await this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock('*Failed to create new page.*\n Hint\n `/growi create`'),
        ],
      });
      throw err;
    }
  }

  // Submit action in create Modal
  async createPageInGrowi(view, body) {
    const User = this.crowi.model('User');
    const Page = this.crowi.model('Page');
    const pathUtils = require('growi-commons').pathUtils;

    const contentsBody = view.state.values.contents.contents_input.value;

    try {
      // search "slackUser" to create page in slack
      const slackUser = await User.findUserByUsername('slackUser');

      let path = view.state.values.path.path_input.value;
      // sanitize path
      path = this.crowi.xss.process(path);
      path = pathUtils.normalizePath(path);

      const user = slackUser._id;
      await Page.create(path, contentsBody, user, {});
    }
    catch (err) {
      this.client.chat.postMessage({
        channel: body.user.id,
        blocks: [
          this.generateMarkdownSectionBlock(`Cannot create new page to existed path\n *Contents* :memo:\n ${contentsBody}`)],
      });
      logger.error('Failed to create page in GROWI.');
      throw err;
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
