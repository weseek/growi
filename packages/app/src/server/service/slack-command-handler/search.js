import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:SlackCommandHandler:search');

const { markdownSectionBlock, divider } = require('@growi/slack');
const { formatDistanceStrict } = require('date-fns');
const axios = require('axios');
const SlackbotError = require('../../models/vo/slackbot-error');

const PAGINGLIMIT = 10;

module.exports = (crowi) => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler(crowi);

  handler.handleCommand = async function(client, body, args) {
    let searchResult;
    try {
      searchResult = await this.retrieveSearchResults(client, body, args);
    }
    catch (err) {
      logger.error('Failed to get search results.', err);
      throw new SlackbotError({
        method: 'postEphemeral',
        to: 'channel',
        popupMessage: 'Failed To Search',
        mainMessage: '*Failed to search.*\n Hint\n `/growi search [keyword]`',
      });
    }

    const appUrl = crowi.appService.getSiteUrl();
    const appTitle = crowi.appService.getAppTitle();

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
            action_id: 'search:shareSinglePageResult',
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
          action_id: 'search:dismissSearchResults',
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
          action_id: 'search:showNextResults',
          value: JSON.stringify({ offset, body, args }),
        },
      );
    }
    blocks.push(actionBlocks);

    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'Successed To Search',
      blocks,
    });
  };

  handler.handleBlockActions = async function(client, payload, handlerMethodName) {
    await this[handlerMethodName](client, payload);
  };

  handler.shareSinglePageResult = async function(client, payload) {
    const { channel, user, actions } = payload;

    const appUrl = crowi.appService.getSiteUrl();
    const appTitle = crowi.appService.getAppTitle();

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
  };

  handler.showNextResults = async function(client, payload) {
    const parsedValue = JSON.parse(payload.actions[0].value);

    const { body, args, offsetNum } = parsedValue;
    const newOffsetNum = offsetNum + 10;
    let searchResult;
    try {
      searchResult = await this.retrieveSearchResults(client, body, args, newOffsetNum);
    }
    catch (err) {
      logger.error('Failed to get search results.', err);
      throw new SlackbotError({
        method: 'postEphemeral',
        to: 'channel',
        popupMessage: 'Failed To Search',
        mainMessage: '*Failed to search.*\n Hint\n `/growi search [keyword]`',
      });
    }

    const appUrl = crowi.appService.getSiteUrl();
    const appTitle = crowi.appService.getAppTitle();

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
          action_id: 'search:dismissSearchResults',
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
          action_id: 'search:showNextResults',
          value: JSON.stringify({ offset, body, args }),
        },
      );
    }
    blocks.push(actionBlocks);

    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'Successed To Search',
      blocks,
    });
  };

  handler.dismissSearchResults = async function(client, payload) {
    const { response_url: responseUrl } = payload;

    return axios.post(responseUrl, {
      delete_original: true,
    });
  };

  handler.retrieveSearchResults = async function(client, body, args, offset = 0) {
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
      return { pages: [] };
    }

    const keywords = this.getKeywords(args);

    const { searchService } = crowi;
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
  };

  handler.getKeywords = function(args) {
    const keywordsArr = args.slice(1);
    const keywords = keywordsArr.join(' ');
    return keywords;
  };

  handler.appendSpeechBaloon = function(mrkdwn, commentCount) {
    return (commentCount != null && commentCount > 0)
      ? `${mrkdwn}   :speech_balloon: ${commentCount}`
      : mrkdwn;
  };

  handler.generatePageLinkMrkdwn = function(pathname, href) {
    return `<${decodeURI(href)} | ${decodeURI(pathname)}>`;
  };

  handler.generateLastUpdateMrkdwn = function(updatedAt, baseDate) {
    if (updatedAt != null) {
      // cast to date
      const date = new Date(updatedAt);
      return formatDistanceStrict(date, baseDate);
    }
    return '';
  };

  return handler;
};
