const logger = require('@alias/logger')('growi:service:BoltService');
const mongoose = require('mongoose');

const PAGINGLIMIT = 10;

class BoltReciever {

  init(app) {
    this.bolt = app;
  }

  async requestHandler(body) {
    if (this.bolt === undefined) {
      throw new Error('Slack Bot service is not setup');
    }

    let ackCalled = false;

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
          return;
        }

        ackCalled = true;

        if (response instanceof Error) {
          const message = response.message || 'Error occurred';
          throw new Error(message);
        }
        return;
      },
    };

    await this.bolt.processEvent(event);
  }

}

const { App } = require('@slack/bolt');
const { WebClient, LogLevel } = require('@slack/web-api');
const S2sMessage = require('../models/vo/s2s-message');
const S2sMessageHandlable = require('./s2s-messaging/handlable');

class BoltService extends S2sMessageHandlable {

  constructor(crowi) {
    super();

    this.crowi = crowi;
    this.s2sMessagingService = crowi.s2sMessagingService;
    this.receiver = new BoltReciever();
    this.client = null;

    this.isBoltSetup = false;
    this.lastLoadedAt = null;

    this.initialize();
  }

  initialize() {
    this.isBoltSetup = false;

    const token = this.crowi.configManager.getConfig('crowi', 'slackbot:token');
    const signingSecret = this.crowi.configManager.getConfig('crowi', 'slackbot:signingSecret');

    this.client = new WebClient(token, { logLevel: LogLevel.DEBUG });

    if (token == null || signingSecret == null) {
      this.bolt = null;
      return;
    }

    this.bolt = new App({
      token,
      signingSecret,
      receiver: this.receiver,
    });
    this.setupRoute();

    logger.debug('SlackBot: setup is done');

    this.isBoltSetup = true;
    this.lastLoadedAt = new Date();
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage) {
    const { eventName, updatedAt } = s2sMessage;
    if (eventName !== 'boltServiceUpdated' || updatedAt == null) {
      return false;
    }

    return this.lastLoadedAt == null || this.lastLoadedAt < new Date(s2sMessage.updatedAt);
  }


  /**
   * @inheritdoc
   */
  async handleS2sMessage() {
    const { configManager } = this.crowi;

    logger.info('Reset bolt by pubsub notification');
    await configManager.loadConfigs();
    this.initialize();
  }

  async publishUpdatedMessage() {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('boltServiceUpdated', { updatedAt: new Date() });

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
      }
    }
  }


  setupRoute() {
    this.bolt.command('/growi', async({
      command, client, body, ack,
    }) => {
      await ack();
      this.verifyAccessToken(body, command);

      const args = command.text.split(' ');
      const firstArg = args[0];

      switch (firstArg) {
        case 'search':
          await this.showEphemeralSearchResults(command, args);
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

    this.bolt.action('showNextResults', async({
      ack, action,
    }) => {
      await ack();
      const parsedValue = JSON.parse(action.value);

      const command = parsedValue.command;
      const args = parsedValue.args;
      const offset = parsedValue.offset;

      const newOffset = offset + 10;
      this.showEphemeralSearchResults(command, args, newOffset);
    });

    this.bolt.action('shareSearchResults', async({
      body, ack, say, action,
    }) => {
      await ack();
      await say(action.value);
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
    return;
  }

  getKeywords(args) {
    const keywordsArr = args.slice(1);
    const keywords = keywordsArr.join(' ');
    return keywords;
  }

  async getSearchResultPaths(command, args, offset = 0) {
    const firstKeyword = args[1];
    if (firstKeyword == null) {
      this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock('*Input keywords.*\n Hint\n `/growi search [keyword]`'),
        ],
      });
      return;
    }

    const keywords = this.getKeywords(args);

    const { searchService } = this.crowi;
    const options = { limit: 10, offset };
    const results = await searchService.searchKeyword(keywords, null, {}, options);
    const resultsTotal = results.meta.total;

    // no search results
    if (results.data.length === 0) {
      logger.info(`No page found with "${keywords}"`);
      this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock(`*No page that matches your keyword(s) "${keywords}".*`),
          this.generateMarkdownSectionBlock(':mag: *Help: Searching*'),
          this.divider(),
          this.generateMarkdownSectionBlock('`word1` `word2` (divide with space) \n Search pages that include both word1, word2 in the title or body'),
          this.divider(),
          this.generateMarkdownSectionBlock('`"This is GROWI"` (surround with double quotes) \n Search pages that include the phrase "This is GROWI"'),
          this.divider(),
          this.generateMarkdownSectionBlock('`-keyword` \n Exclude pages that include keyword in the title or body'),
          this.divider(),
          this.generateMarkdownSectionBlock('`prefix:/user/` \n Search only the pages that the title start with /user/'),
          this.divider(),
          this.generateMarkdownSectionBlock('`-prefix:/user/` \n Exclude the pages that the title start with /user/'),
          this.divider(),
          this.generateMarkdownSectionBlock('`tag:wiki` \n Search for pages with wiki tag'),
          this.divider(),
          this.generateMarkdownSectionBlock('`-tag:wiki` \n Exclude pages with wiki tag'),
        ],
      });
      return { resultPaths: [] };
    }

    const resultPaths = results.data.map((data) => {
      return data._source.path;
    });

    return {
      resultPaths, offset, resultsTotal,
    };
  }

  async showEphemeralSearchResults(command, args, offsetNum) {
    const {
      resultPaths, offset, resultsTotal,
    } = await this.getSearchResultPaths(command, args, offsetNum);

    const keywords = this.getKeywords(args);

    if (resultPaths.length === 0) {
      return;
    }

    const base = this.crowi.appService.getSiteUrl();

    const urls = resultPaths.map((path) => {
      const url = new URL(path, base);
      return `<${decodeURI(url.href)} | ${decodeURI(url.pathname)}>`;
    });

    const searchResultsNum = resultPaths.length;
    let searchResultsDesc;

    switch (searchResultsNum) {
      case 10:
        searchResultsDesc = 'Maximum number of results that can be displayed is 10';
        break;

      case 1:
        searchResultsDesc = `${searchResultsNum} page is found`;
        break;

      default:
        searchResultsDesc = `${searchResultsNum} pages are found`;
        break;
    }

    const keywordsAndDesc = `keyword(s) : "${keywords}" \n ${searchResultsDesc}.`;

    try {
      // DEFAULT show "Share" button
      const actionBlocks = {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Share',
            },
            style: 'primary',
            action_id: 'shareSearchResults',
            value: `${keywordsAndDesc} \n\n ${urls.join('\n')}`,
          },
        ],
      };
      // show "Next" button if next page exists
      if (resultsTotal > offset + PAGINGLIMIT) {
        actionBlocks.elements.unshift(
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Next',
            },
            action_id: 'showNextResults',
            value: JSON.stringify({ offset, command, args }),
          },
        );
      }
      await this.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: [
          this.generateMarkdownSectionBlock(keywordsAndDesc),
          this.generateMarkdownSectionBlock(`${urls.join('\n')}`),
          actionBlocks,
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
          this.generateMarkdownSectionBlock(`*Failed to create new page.*\n ${err}`),
        ],
      });
      throw err;
    }
  }

  // Submit action in create Modal
  async createPageInGrowi(view, body) {
    const Page = this.crowi.model('Page');
    const pathUtils = require('growi-commons').pathUtils;

    const contentsBody = view.state.values.contents.contents_input.value;

    try {
      let path = view.state.values.path.path_input.value;
      // sanitize path
      path = this.crowi.xss.process(path);
      path = pathUtils.normalizePath(path);

      // generate a dummy id because Operation to create a page needs ObjectId
      const dummyObjectIdOfUser = new mongoose.Types.ObjectId();
      await Page.create(path, contentsBody, dummyObjectIdOfUser, {});
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

  divider() {
    return {
      type: 'divider',
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
