
const logger = require('@alias/logger')('growi:service:SlackBotService');
const mongoose = require('mongoose');

const PAGINGLIMIT = 10;

const { reshapeContentsBody } = require('@growi/slack');

const S2sMessage = require('../models/vo/s2s-message');
const S2sMessageHandlable = require('./s2s-messaging/handlable');

class SlackBotService extends S2sMessageHandlable {

  constructor(crowi) {
    super();

    this.crowi = crowi;
    this.s2sMessagingService = crowi.s2sMessagingService;

    this.lastLoadedAt = null;

    this.initialize();
  }

  initialize() {
    this.lastLoadedAt = new Date();
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage) {
    const { eventName, updatedAt } = s2sMessage;
    if (eventName !== 'slackBotServiceUpdated' || updatedAt == null) {
      return false;
    }

    return this.lastLoadedAt == null || this.lastLoadedAt < new Date(s2sMessage.updatedAt);
  }


  /**
   * @inheritdoc
   */
  async handleS2sMessage() {
    const { configManager } = this.crowi;

    logger.info('Reset slack bot by pubsub notification');
    await configManager.loadConfigs();
    this.initialize();
  }

  async publishUpdatedMessage() {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('slackBotServiceUpdated', { updatedAt: new Date() });

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
      }
    }
  }

  async notCommand(client, body) {
    logger.error('Invalid first argument');
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'No command',
      blocks: [
        this.generateMarkdownSectionBlock('*No command.*\n Hint\n `/growi [command] [keyword]`'),
      ],
    });
    return;
  }

  async helpCommand(client, body) {
    const message = '*Help*\n growi-bot usage\n `/growi [command] [args]`\n\n Create new page\n `create`\n\n Search pages\n `search [keyword]`';
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'Help',
      blocks: [
        this.generateMarkdownSectionBlock(message),
      ],
    });
    return;
  }

  async togetterCommand(client, body, args) {
    // args一旦無視で
    // Checkbox Message を返す
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'Select messages to use.',
      blocks: this.togetterMessageBlocks(),
    });
  }

  getKeywords(args) {
    const keywordsArr = args.slice(1);
    const keywords = keywordsArr.join(' ');
    return keywords;
  }

  async getSearchResultPaths(client, body, args, offset = 0) {
    const firstKeyword = args[1];
    if (firstKeyword == null) {
      client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: 'Input keywords',
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
      client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: `No page found with "${keywords}"`,
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

  async shareSearchResults(client, payload) {
    client.chat.postMessage({
      channel: payload.channel.id,
      text: JSON.parse(payload.actions[0].value).pageList,
    });
  }

  async showEphemeralSearchResults(client, body, args, offsetNum) {
    const {
      resultPaths, offset, resultsTotal,
    } = await this.getSearchResultPaths(client, body, args, offsetNum);

    const keywords = this.getKeywords(args);

    if (resultPaths.length === 0) {
      return;
    }

    const appUrl = this.crowi.appService.getSiteUrl();
    const appTitle = this.crowi.appService.getAppTitle();

    const urls = resultPaths.map((path) => {
      const url = new URL(path, appUrl);
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
            value: JSON.stringify({
              offset, body, args, pageList: `${keywordsAndDesc} \n\n ${urls.join('\n')}`,
            }),
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
            value: JSON.stringify({ offset, body, args }),
          },
        );
      }
      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: 'Successed To Search',
        blocks: [
          this.generateMarkdownSectionBlock(`<${decodeURI(appUrl)}|*${appTitle}*>`),
          this.generateMarkdownSectionBlock(keywordsAndDesc),
          this.generateMarkdownSectionBlock(`${urls.join('\n')}`),
          actionBlocks,
        ],
      });
    }
    catch (err) {
      logger.error('Failed to get search results.', err);
      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: 'Failed To Search',
        blocks: [
          this.generateMarkdownSectionBlock('*Failed to search.*\n Hint\n `/growi search [keyword]`'),
        ],
      });
      throw new Error('/growi command:search: Failed to search');
    }
  }

  async createModal(client, body) {
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
          private_metadata: JSON.stringify({ channelId: body.channel_id }),
        },
      });
    }
    catch (err) {
      logger.error('Failed to create a page.');
      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: 'Failed To Create',
        blocks: [
          this.generateMarkdownSectionBlock(`*Failed to create new page.*\n ${err}`),
        ],
      });
      throw err;
    }
  }

  // Submit action in create Modal
  async createPageInGrowi(client, payload) {
    const Page = this.crowi.model('Page');
    const pathUtils = require('growi-commons').pathUtils;
    const contentsBody = reshapeContentsBody(payload.view.state.values.contents.contents_input.value);

    try {
      let path = payload.view.state.values.path.path_input.value;
      // sanitize path
      path = this.crowi.xss.process(path);
      path = pathUtils.normalizePath(path);

      // generate a dummy id because Operation to create a page needs ObjectId
      const dummyObjectIdOfUser = new mongoose.Types.ObjectId();
      const page = await Page.create(path, contentsBody, dummyObjectIdOfUser, {});

      // Send a message when page creation is complete
      const growiUri = this.crowi.appService.getSiteUrl();
      const channelId = JSON.parse(payload.view.private_metadata).channelId;
      await client.chat.postEphemeral({
        channel: channelId,
        user: payload.user.id,
        text: `The page <${decodeURI(`${growiUri}/${page._id} | ${decodeURI(growiUri + path)}`)}> has been created.`,
      });
    }
    catch (err) {
      client.chat.postMessage({
        channel: payload.user.id,
        blocks: [
          this.generateMarkdownSectionBlock(`Cannot create new page to existed path\n *Contents* :memo:\n ${contentsBody}`)],
      });
      logger.error('Failed to create page in GROWI.');
      throw err;
    }
  }

  generateMarkdownSectionBlock(text) {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
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

  togetterMessageBlocks() {
    return [
      this.generateMarkdownSectionBlock('Select messages to use.'),
      this.actionsBlock(this.buttonElement('Show more', 'show_more'), this.buttonElement('Check all', 'check_all')),
      this.actionsBlock(this.togetterCheckboxesElement()),
      this.inputBlock(this.togetterInputBlockElement('page_path'), 'Page path'),
      this.actionsBlock(this.buttonElement('Cancel', 'cancel'), this.buttonElement('Create page', 'create_page')),
    ];
  }

  actionsBlock(...elements) {
    return {
      type: 'actions',
      elements: [
        ...elements,
      ],
    };
  }

  inputBlock(element, labelText) {
    return {
      type: 'input',
      element,
      label: {
        type: 'plain_text',
        text: labelText,
        emoji: true,
      },
    };
  }

  /**
   * Button element
   * https://api.slack.com/reference/block-kit/block-elements#button
   */
  buttonElement(text, actionId) {
    return {
      type: 'button',
      text: {
        type: 'plain_text',
        text,
      },
      action_id: actionId,
    };
  }

  togetterCheckboxesElement() {
    return {
      type: 'checkboxes',
      options: this.togetterCheckboxesElementOptions(),
      action_id: 'checkboxes_changed',
    };
  }

  togetterCheckboxesElementOptions() {
    // options を conversations.history の結果でインクリメント
    const options = [];
    // 仮置き
    for (let i = 0; i < 10; i++) {
      const option = this.checkboxesElementOption('*username*  12:00PM', 'sample slack messages ... :star:');
      options.push(option);
    }
    return options;
  }

  /**
   * Option object
   * https://api.slack.com/reference/block-kit/composition-objects#option
   */
  checkboxesElementOption(text, description) {
    return {
      text: {
        type: 'mrkdwn',
        text,
      },
      description: {
        type: 'mrkdwn',
        text: description,
      },
      value: 'selected',
    };
  }

  /**
   * Plain-text input element
   * https://api.slack.com/reference/block-kit/block-elements#input
   */
  togetterInputBlockElement(actionId) {
    return {
      type: 'plain_text_input',
      action_id: actionId,
    };
  }

}

module.exports = SlackBotService;
