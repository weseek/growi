import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:SlackCommandHandler:search');

const {
  markdownSectionBlock, divider, respond, respondInChannel, replaceOriginal, deleteOriginal,
} = require('@growi/slack');
const { formatDistanceStrict } = require('date-fns');
const SlackbotError = require('../../models/vo/slackbot-error');

const PAGINGLIMIT = 7;


module.exports = (crowi) => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler(crowi);


  function getKeywords(growiCommandArgs) {
    const keywords = growiCommandArgs.join(' ');
    return keywords;
  }

  function appendSpeechBaloon(mrkdwn, commentCount) {
    return (commentCount != null && commentCount > 0)
      ? `${mrkdwn}   :speech_balloon: ${commentCount}`
      : mrkdwn;
  }

  function generateSearchResultPageLinkMrkdwn(appUrl, growiCommandArgs) {
    const url = new URL('/_search', appUrl);
    url.searchParams.append('q', growiCommandArgs.map(kwd => encodeURIComponent(kwd)).join('+'));
    return `<${url.href} | Results page>`;
  }

  function generatePageLinkMrkdwn(pathname, href) {
    return `<${decodeURI(href)} | ${decodeURI(pathname)}>`;
  }

  function generateLastUpdateMrkdwn(updatedAt, baseDate) {
    if (updatedAt != null) {
      // cast to date
      const date = new Date(updatedAt);
      return formatDistanceStrict(date, baseDate);
    }
    return '';
  }

  async function retrieveSearchResults(growiCommandArgs, offset = 0) {
    const keywords = getKeywords(growiCommandArgs);

    const { searchService } = crowi;
    const options = { limit: PAGINGLIMIT, offset };
    const results = await searchService.searchKeyword(keywords, null, {}, options);
    const resultsTotal = results.meta.total;

    const pages = results.data.map((data) => {
      const { path, updated_at: updatedAt, comment_count: commentCount } = data._source;
      return { path, updatedAt, commentCount };
    });

    return {
      pages, offset, resultsTotal,
    };
  }

  function buildRespondBodyForSearchResult(searchResult, growiCommandArgs) {
    const appUrl = crowi.appService.getSiteUrl();
    const appTitle = crowi.appService.getAppTitle();

    const {
      pages, offset, resultsTotal,
    } = searchResult;

    const keywords = getKeywords(growiCommandArgs);

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
          text: `keyword(s) : *"${keywords}"*`
          + `  |  Total ${resultsTotal} pages`
          + `  |  Current: ${offset + 1} - ${offset + pages.length}`
          + `  |  ${generateSearchResultPageLinkMrkdwn(appUrl, growiCommandArgs)}`,
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
            text: `${appendSpeechBaloon(`*${generatePageLinkMrkdwn(pathname, href)}*`, commentCount)}`
              + `  \`${generateLastUpdateMrkdwn(updatedAt, now)}\``,
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
    // show "Prev" button if previous page exists
    // eslint-disable-next-line yoda
    if (0 < offset) {
      actionBlocks.elements.unshift(
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '< Prev',
          },
          action_id: 'search:showPrevResults',
          value: JSON.stringify({ offset, growiCommandArgs }),
        },
      );
    }
    // show "Next" button if next page exists
    if (offset + PAGINGLIMIT < resultsTotal) {
      actionBlocks.elements.unshift(
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Next >',
          },
          action_id: 'search:showNextResults',
          value: JSON.stringify({ offset, growiCommandArgs }),
        },
      );
    }
    blocks.push(actionBlocks);

    return {
      text: 'Successed To Search',
      blocks,
    };
  }


  async function buildRespondBody(growiCommandArgs) {
    const firstKeyword = growiCommandArgs[0];

    // enpty keyword
    if (firstKeyword == null) {
      return {
        text: 'Input keywords',
        blocks: [
          markdownSectionBlock('*Input keywords.*\n Hint\n `/growi search [keyword]`'),
        ],
      };
    }

    const searchResult = await retrieveSearchResults(growiCommandArgs);

    // no search results
    if (searchResult.resultsTotal === 0) {
      const keywords = getKeywords(growiCommandArgs);
      logger.info(`No page found with "${keywords}"`);

      return {
        text: `No page found with "${keywords}"`,
        blocks: [
          markdownSectionBlock(`*No page matches your keyword(s) "${keywords}".*`),
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
      };
    }

    return buildRespondBodyForSearchResult(searchResult, growiCommandArgs);
  }


  handler.handleCommand = async function(growiCommand, client, body) {
    const { responseUrl, growiCommandArgs } = growiCommand;

    const respondBody = await buildRespondBody(growiCommandArgs);
    await respond(responseUrl, respondBody);
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
    return respondInChannel(responseUrl, {
      blocks: [
        { type: 'divider' },
        markdownSectionBlock(`${appendSpeechBaloon(`*${generatePageLinkMrkdwn(pathname, href)}*`, commentCount)}`),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `<${decodeURI(appUrl)}|*${appTitle}*>`
                + `  |  Last updated: \`${generateLastUpdateMrkdwn(updatedAt, now)}\``
                + `  |  Shared by *${user.username}*`,
            },
          ],
        },
      ],
    });
  };

  async function showPrevOrNextResults(interactionPayloadAccessor, isNext = true) {
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

    const { growiCommandArgs, offset: offsetNum } = parsedValue;
    const newOffsetNum = isNext
      ? offsetNum + PAGINGLIMIT
      : offsetNum - PAGINGLIMIT;

    const searchResult = await retrieveSearchResults(growiCommandArgs, newOffsetNum);

    await replaceOriginal(responseUrl, buildRespondBodyForSearchResult(searchResult, growiCommandArgs));
  }

  handler.showPrevResults = async function(client, payload, interactionPayloadAccessor) {
    return showPrevOrNextResults(interactionPayloadAccessor, false);
  };

  handler.showNextResults = async function(client, payload, interactionPayloadAccessor) {
    return showPrevOrNextResults(interactionPayloadAccessor, true);
  };

  handler.dismissSearchResults = async function(client, payload) {
    const { response_url: responseUrl } = payload;

    return deleteOriginal(responseUrl, {
      delete_original: true,
    });
  };

  return handler;
};
