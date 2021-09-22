import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:SlackCommandHandler:search');

const {
  markdownSectionBlock, divider, respond, deleteOriginal,
} = require('@growi/slack');
const { formatDistanceStrict } = require('date-fns');
const SlackbotError = require('../../models/vo/slackbot-error');

const PAGINGLIMIT = 10;

module.exports = (crowi) => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler(crowi);

  handler.handleCommand = async function(growiCommand, client, body) {
    const { responseUrl, growiCommandArgs } = growiCommand;
    let searchResult;
    try {
      searchResult = await this.retrieveSearchResults(responseUrl, client, body, growiCommandArgs);
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

    const keywords = this.getKeywords(growiCommandArgs);


    let searchResultsDesc;

    if (resultsTotal === 0) {
      await respond(responseUrl, {
        text: 'No page found.',
        blocks: [
          markdownSectionBlock('Please try with other keywords.'),
        ],
      });
      return;
    }
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
          value: JSON.stringify({ offset, body, growiCommandArgs }),
        },
      );
    }
    blocks.push(actionBlocks);

    await respond(responseUrl, {
      text: 'Successed To Search',
      blocks,
    });
  };

  handler.handleInteractions = async function(client, interactionPayload, interactionPayloadAccessor, handlerMethodName) {
    await this[handlerMethodName](client, interactionPayload, interactionPayloadAccessor);
  };

  handler.shareSinglePageResult = async function(client, payload, interactionPayloadAccessor) {
    const { user } = payload;
    const responseUrl = interactionPayloadAccessor.getResponseUrl();

    const appUrl = crowi.appService.getSiteUrl();
    const appTitle = crowi.appService.getAppTitle();

    const value = interactionPayloadAccessor.firstAction()?.value; // shareSinglePage action must have button action
    if (value == null) {
      await respond(responseUrl, {
        text: 'Error occurred',
        blocks: [
          markdownSectionBlock('Failed to share the result.'),
        ],
      });
      return;
    }

    // restore page data from value
    const { page, href, pathname } = JSON.parse(value);
    const { updatedAt, commentCount } = page;

    // share
    const now = new Date();
    return respond(responseUrl, {
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

  handler.showNextResults = async function(client, payload, interactionPayloadAccessor) {
    const responseUrl = interactionPayloadAccessor.getResponseUrl();

    const value = interactionPayloadAccessor.firstAction()?.value;
    if (value == null) {
      await respond(responseUrl, {
        text: 'Error occurred',
        blocks: [
          markdownSectionBlock('Failed to show the next results.'),
        ],
      });
      return;
    }
    const parsedValue = JSON.parse(value);

    const { body, growiCommandArgs, offset: offsetNum } = parsedValue;
    const newOffsetNum = offsetNum + 10;
    let searchResult;
    try {
      searchResult = await this.retrieveSearchResults(responseUrl, client, body, growiCommandArgs, newOffsetNum);
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

    const keywords = this.getKeywords(growiCommandArgs);


    let searchResultsDesc;

    if (resultsTotal === 0) {
      await respond(responseUrl, {
        text: 'No page found.',
        blocks: [
          markdownSectionBlock('Please try with other keywords.'),
        ],
      });
      return;
    }
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
          value: JSON.stringify({ offset, body, growiCommandArgs }),
        },
      );
    }
    blocks.push(actionBlocks);

    await respond(responseUrl, {
      text: 'Successed To Search',
      blocks,
    });
  };

  handler.dismissSearchResults = async function(client, payload) {
    const { response_url: responseUrl } = payload;

    return deleteOriginal(responseUrl, {
      delete_original: true,
    });
  };

  handler.retrieveSearchResults = async function(responseUrl, client, body, growiCommandArgs, offset = 0) {
    const firstKeyword = growiCommandArgs[0];
    if (firstKeyword == null) {
      await respond(responseUrl, {
        text: 'Input keywords',
        blocks: [
          markdownSectionBlock('*Input keywords.*\n Hint\n `/growi search [keyword]`'),
        ],
      });
      return { pages: [] };
    }

    const keywords = this.getKeywords(growiCommandArgs);

    const { searchService } = crowi;
    const options = { limit: 10, offset };
    const results = await searchService.searchKeyword(keywords, null, {}, options);
    const resultsTotal = results.meta.total;

    // no search results
    if (results.data.length === 0) {
      logger.info(`No page found with "${keywords}"`);
      await respond(responseUrl, {
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

  handler.getKeywords = function(growiCommandArgs) {
    const keywords = growiCommandArgs.join(' ');
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
