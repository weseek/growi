
const logger = require('@alias/logger')('growi:service:SlackBotService');
const mongoose = require('mongoose');
const axios = require('axios');

const { markdownSectionBlock, divider } = require('@growi/slack');
const { reshapeContentsBody } = require('@growi/slack');
const { formatDistanceStrict, parse, format } = require('date-fns');

const S2sMessage = require('../models/vo/s2s-message');
const S2sMessageHandlable = require('./s2s-messaging/handlable');

const PAGINGLIMIT = 10;

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
        markdownSectionBlock('*No command.*\n Hint\n `/growi [command] [keyword]`'),
      ],
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
        markdownSectionBlock(`${this.appendSpeechBaloon(`*${this.generatePageLinkMrkdwn(pathname, href)}*`, commentCount)}`),
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

  async showEphemeralSearchResults(client, body, args, offsetNum) {
    let searchResult;
    try {
      searchResult = await this.retrieveSearchResults(client, body, args, offsetNum);
    }
    catch (err) {
      logger.error('Failed to get search results.', err);
      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: 'Failed To Search',
        blocks: [
          markdownSectionBlock('*Failed to search.*\n Hint\n `/growi search [keyword]`'),
        ],
      });
      throw new Error('/growi command:search: Failed to search');
    }

    const appUrl = this.crowi.appService.getSiteUrl();
    const appTitle = this.crowi.appService.getAppTitle();

    const {
      pages, offset, resultsTotal,
    } = searchResult;

    const keywords = this.getKeywords(args);


    let searchResultsDesc;

    switch (resultsTotal) {
      case 1:
        searchResultsDesc = `*${resultsTotal}* page is found.`;
        break;

      default:
        searchResultsDesc = `*${resultsTotal}* pages are found.`;
        break;
    }


    const contextBlock = {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `keyword(s) : *"${keywords}"*  |  Current: ${offset + 1} - ${offset + pages.length}  |  Total ${resultsTotal} pages`,
        },
      ],
    };

    const now = new Date();
    const blocks = [
      markdownSectionBlock(`:mag: <${decodeURI(appUrl)}|*${appTitle}*>\n${searchResultsDesc}`),
      contextBlock,
      { type: 'divider' },
      // create an array by map and extract
      ...pages.map((page) => {
        const { path, updatedAt, commentCount } = page;
        // generate URL
        const url = new URL(path, appUrl);
        const { href, pathname } = url;

        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${this.appendSpeechBaloon(`*${this.generatePageLinkMrkdwn(pathname, href)}*`, commentCount)}`
              + `\n    Last updated: ${this.generateLastUpdateMrkdwn(updatedAt, now)}`,
          },
          accessory: {
            type: 'button',
            action_id: 'shareSingleSearchResult',
            text: {
              type: 'plain_text',
              text: 'Share',
            },
            value: JSON.stringify({ page, href, pathname }),
          },
        };
      }),
      { type: 'divider' },
      contextBlock,
    ];

    // DEFAULT show "Share" button
    // const actionBlocks = {
    //   type: 'actions',
    //   elements: [
    //     {
    //       type: 'button',
    //       text: {
    //         type: 'plain_text',
    //         text: 'Share',
    //       },
    //       style: 'primary',
    //       action_id: 'shareSearchResults',
    //     },
    //   ],
    // };
    const actionBlocks = {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Dismiss',
          },
          style: 'danger',
          action_id: 'dismissSearchResults',
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
    blocks.push(actionBlocks);

    try {
      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: 'Successed To Search',
        blocks,
      });
    }
    catch (err) {
      logger.error('Failed to post ephemeral message.', err);
      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: 'Failed to post ephemeral message.',
        blocks: [
          markdownSectionBlock(err.toString()),
        ],
      });
      throw new Error(err);
    }
  }

  async retrieveSearchResults(client, body, args, offset = 0) {
    const firstKeyword = args[1];
    if (firstKeyword == null) {
      client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: 'Input keywords',
        blocks: [
          markdownSectionBlock('*Input keywords.*\n Hint\n `/growi search [keyword]`'),
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
          markdownSectionBlock(`*No page that matches your keyword(s) "${keywords}".*`),
          markdownSectionBlock(':mag: *Help: Searching*'),
          divider(),
          markdownSectionBlock('`word1` `word2` (divide with space) \n Search pages that include both word1, word2 in the title or body'),
          divider(),
          markdownSectionBlock('`"This is GROWI"` (surround with double quotes) \n Search pages that include the phrase "This is GROWI"'),
          divider(),
          markdownSectionBlock('`-keyword` \n Exclude pages that include keyword in the title or body'),
          divider(),
          markdownSectionBlock('`prefix:/user/` \n Search only the pages that the title start with /user/'),
          divider(),
          markdownSectionBlock('`-prefix:/user/` \n Exclude the pages that the title start with /user/'),
          divider(),
          markdownSectionBlock('`tag:wiki` \n Search for pages with wiki tag'),
          divider(),
          markdownSectionBlock('`-tag:wiki` \n Exclude pages with wiki tag'),
        ],
      });
      return { pages: [] };
    }

    const pages = results.data.map((data) => {
      const { path, updated_at: updatedAt, comment_count: commentCount } = data._source;
      return { path, updatedAt, commentCount };
    });

    return {
      pages, offset, resultsTotal,
    };
  }

  getKeywords(args) {
    const keywordsArr = args.slice(1);
    const keywords = keywordsArr.join(' ');
    return keywords;
  }

  // Submit action in create Modal
  async createPage(client, payload, path, channelId, contentsBody) {
    const Page = this.crowi.model('Page');
    const pathUtils = require('growi-commons').pathUtils;
    const reshapedContentsBody = reshapeContentsBody(contentsBody);
    try {
      // sanitize path
      const sanitizedPath = this.crowi.xss.process(path);
      const normalizedPath = pathUtils.normalizePath(sanitizedPath);

      // generate a dummy id because Operation to create a page needs ObjectId
      const dummyObjectIdOfUser = new mongoose.Types.ObjectId();
      const page = await Page.create(normalizedPath, reshapedContentsBody, dummyObjectIdOfUser, {});

      // Send a message when page creation is complete
      const growiUri = this.crowi.appService.getSiteUrl();
      await client.chat.postEphemeral({
        channel: channelId,
        user: payload.user.id,
        text: `The page <${decodeURI(`${growiUri}/${page._id} | ${decodeURI(growiUri + normalizedPath)}`)}> has been created.`,
      });
    }
    catch (err) {
      client.chat.postMessage({
        channel: payload.user.id,
        blocks: [
          markdownSectionBlock(`Cannot create new page to existed path\n *Contents* :memo:\n ${reshapedContentsBody}`)],
      });
      logger.error('Failed to create page in GROWI.');
      throw err;
    }
  }

  async createPageInGrowi(client, payload) {
    const path = payload.view.state.values.path.path_input.value;
    const channelId = JSON.parse(payload.view.private_metadata).channelId;
    const contentsBody = payload.view.state.values.contents.contents_input.value;
    await this.createPage(client, payload, path, channelId, contentsBody);
  }

  async togetterCreatePageInGrowi(client, payload) {
    let result = [];
    const channel = payload.channel.id;
    try {
      // validate form
      const { path, oldest, latest } = await this.togetterValidateForm(client, payload);
      // get messages
      result = await this.togetterGetMessages(client, payload, channel, path, latest, oldest);
      // clean messages
      const cleanedContents = await this.togetterCleanMessages(result.messages);

      const contentsBody = cleanedContents.join('');
      // create and send url message
      await this.togetterCreatePageAndSendPreview(client, payload, path, channel, contentsBody);
    }
    catch (err) {
      await client.chat.postMessage({
        channel: payload.user.id,
        text: err.message,
        blocks: [
          markdownSectionBlock(err.message),
        ],
      });
      return;
    }
  }

  async togetterGetMessages(client, payload, channel, path, latest, oldest) {
    const result = await client.conversations.history({
      channel,
      latest,
      oldest,
      limit: 100,
      inclusive: true,
    });

    // return if no message found
    if (!result.messages.length) {
      throw new Error('No message found from togetter command. Try again.');
    }
    return result;
  }

  async togetterValidateForm(client, payload) {
    const grwTzoffset = this.crowi.appService.getTzoffset() * 60;
    const path = payload.state.values.page_path.page_path.value;
    let oldest = payload.state.values.oldest.oldest.value;
    let latest = payload.state.values.latest.latest.value;
    oldest = oldest.trim();
    latest = latest.trim();
    if (!path) {
      throw new Error('Page path is required.');
    }
    /**
     * RegExp for datetime yyyy/MM/dd-HH:mm
     * @see https://regex101.com/r/XbxdNo/1
     */
    const regexpDatetime = new RegExp(/^[12]\d\d\d\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])-([01][0-9]|2[0123]):[0-5][0-9]$/);

    if (!regexpDatetime.test(oldest)) {
      throw new Error('Datetime format for oldest must be yyyy/MM/dd-HH:mm');
    }
    if (!regexpDatetime.test(latest)) {
      throw new Error('Datetime format for latest must be yyyy/MM/dd-HH:mm');
    }
    oldest = parse(oldest, 'yyyy/MM/dd-HH:mm', new Date()).getTime() / 1000 + grwTzoffset;
    // + 60s in order to include messages between hh:mm.00s and hh:mm.59s
    latest = parse(latest, 'yyyy/MM/dd-HH:mm', new Date()).getTime() / 1000 + grwTzoffset + 60;

    if (oldest > latest) {
      throw new Error('Oldest datetime must be older than the latest date time.');
    }

    return { path, oldest, latest };
  }

  async togetterCleanMessages(messages) {
    const cleanedContents = [];
    let lastMessage = {};
    const grwTzoffset = this.crowi.appService.getTzoffset() * 60;
    messages
      .sort((a, b) => {
        return a.ts - b.ts;
      })
      .forEach((message) => {
        // increment contentsBody while removing the same headers
        // exclude header
        const lastMessageTs = Math.floor(lastMessage.ts / 60);
        const messageTs = Math.floor(message.ts / 60);
        if (lastMessage.user === message.user && lastMessageTs === messageTs) {
          cleanedContents.push(`${message.text}\n`);
        }
        // include header
        else {
          const ts = (parseInt(message.ts) - grwTzoffset) * 1000;
          const time = format(new Date(ts), 'h:mm a');
          cleanedContents.push(`${message.user}  ${time}\n${message.text}\n`);
          lastMessage = message;
        }
      });
    return cleanedContents;
  }

  async togetterCreatePageAndSendPreview(client, payload, path, channel, contentsBody) {
    try {
      await this.createPage(client, payload, path, channel, contentsBody);
      // send preview to dm
      await client.chat.postMessage({
        channel: payload.user.id,
        text: 'Preview from togetter command',
        blocks: [
          markdownSectionBlock('*Preview*'),
          divider(),
          markdownSectionBlock(contentsBody),
          divider(),
        ],
      });
      // dismiss message
      const responseUrl = payload.response_url;
      axios.post(responseUrl, {
        delete_original: true,
      });
    }
    catch (err) {
      throw new Error('Error occurred while creating a page.');
    }
  }

  async togetterCancel(client, payload) {
    const responseUrl = payload.response_url;
    axios.post(responseUrl, {
      delete_original: true,
    });
  }

}

module.exports = SlackBotService;
