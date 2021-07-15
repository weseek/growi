
const logger = require('@alias/logger')('growi:service:SlackBotService');
const mongoose = require('mongoose');
const axios = require('axios');

const { BlockKitBuilder: B } = require('@growi/slack');
const { reshapeContentsBody } = require('@growi/slack');
const { formatDistanceStrict } = require('date-fns');

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

  /**
   * Handle /commands endpoint
   */
  async handleCommand(command, client, body, ...opt) {
    const module = `./slack-command-handler/${command}`;
    try {
      const handler = require(module)(this.crowi);
      await handler.handleCommand(client, body, ...opt);
    }
    catch (err) {
      this.notCommand(client, body);
    }
  }

  async notCommand(client, body) {
    logger.error('Invalid first argument');
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'No command',
      blocks: [
        B.generateMarkdownSectionBlock('*No command.*\n Hint\n `/growi [command] [keyword]`'),
      ],
    });
    return;
  }

  async togetterCommand(client, body, args, limit = 10) {
    // TODO GW-6721 Get the time from args
    const reusult = await client.conversations.history({
      channel: body.channel_id,
      limit,
    });
    console.log(reusult);
    // Checkbox Message を返す
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'Select messages to use.',
      blocks: this.togetterMessageBlocks(),
    });
    return;
  }

  generatePageLinkMrkdwn(pathname, href) {
    return `<${decodeURI(href)} | ${decodeURI(pathname)}>`;
  }

  appendSpeechBaloon(mrkdwn, commentCount) {
    return (commentCount != null && commentCount > 0)
      ? `${mrkdwn}   :speech_balloon: ${commentCount}`
      : mrkdwn;
  }

  generateLastUpdateMrkdwn(updatedAt, baseDate) {
    if (updatedAt != null) {
      // cast to date
      const date = new Date(updatedAt);
      return formatDistanceStrict(date, baseDate);
    }
    return '';
  }


  async shareSinglePage(client, payload) {
    const { channel, user, actions } = payload;

    const appUrl = this.crowi.appService.getSiteUrl();
    const appTitle = this.crowi.appService.getAppTitle();

    const channelId = channel.id;
    const action = actions[0]; // shareSinglePage action must have button action

    // restore page data from value
    const { page, href, pathname } = JSON.parse(action.value);
    const { updatedAt, commentCount } = page;

    // share
    const now = new Date();
    return client.chat.postMessage({
      channel: channelId,
      blocks: [
        { type: 'divider' },
        B.generateMarkdownSectionBlock(`${this.appendSpeechBaloon(`*${this.generatePageLinkMrkdwn(pathname, href)}*`, commentCount)}`),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `<${decodeURI(appUrl)}|*${appTitle}*>  |  Last updated: ${this.generateLastUpdateMrkdwn(updatedAt, now)}  |  Shared by *${user.username}*`,
            },
          ],
        },
      ],
    });
  }

  async dismissSearchResults(client, payload) {
    const { response_url: responseUrl } = payload;

    return axios.post(responseUrl, {
      delete_original: true,
    });
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
          B.generateMarkdownSectionBlock(`Cannot create new page to existed path\n *Contents* :memo:\n ${contentsBody}`)],
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
      this.inputBlock(this.togetterCheckboxesElement(), 'selected_messages', 'Select massages to use.'),
      this.actionsBlock(this.buttonElement('Show more', 'togetterShowMore')),
      this.inputBlock(this.togetterInputBlockElement('page_path', '/'), 'page_path', 'Page path'),
      this.actionsBlock(this.buttonElement('Cancel', 'togetterCancelPageCreation'), this.buttonElement('Create page', 'togetterCreatePage', 'primary')),
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

  inputBlock(element, blockId, labelText) {
    return {
      type: 'input',
      block_id: blockId,
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
  buttonElement(text, actionId, style = undefined) {
    const button = {
      type: 'button',
      text: {
        type: 'plain_text',
        text,
      },
      action_id: actionId,
    };
    if (style === 'primary' || style === 'danger') {
      button.style = style;
    }
    return button;
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
      const option = this.checkboxesElementOption('*username*  12:00PM', 'sample slack messages ... :star:', `selected-${i}`);
      options.push(option);
    }
    return options;
  }

  /**
   * Option object
   * https://api.slack.com/reference/block-kit/composition-objects#option
   */
  checkboxesElementOption(text, description, value) {
    return {
      text: {
        type: 'mrkdwn',
        text,
      },
      description: {
        type: 'mrkdwn',
        text: description,
      },
      value,
    };
  }

  /**
   * Plain-text input element
   * https://api.slack.com/reference/block-kit/block-elements#input
   */
  togetterInputBlockElement(actionId, placeholderText = 'Write something ...') {
    return {
      type: 'plain_text_input',
      placeholder: {
        type: 'plain_text',
        text: placeholderText,
      },
      action_id: actionId,
    };
  }

}

module.exports = SlackBotService;
