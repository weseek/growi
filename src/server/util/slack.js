import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:util:slack');

const urljoin = require('url-join');

/**
 * slack
 */

/* eslint-disable no-use-before-define */

module.exports = function(crowi) {
  const { IncomingWebhook } = require('@slack/webhook');
  const { WebClient } = require('@slack/web-api');
  const { configManager } = crowi;

  const slack = {};

  const postWithIwh = async(messageObj) => {
    const webhook = new IncomingWebhook(configManager.getConfig('notification', 'slack:incomingWebhookUrl'));
    try {
      await webhook.send(messageObj);
    }
    catch (error) {
      logger.debug('Post error', error);
      logger.debug('Sent data to slack is:', messageObj);
      throw error;
    }
  };

  const postWithWebApi = async(messageObj) => {
    const client = new WebClient(configManager.getConfig('notification', 'slack:token'));
    // stringify attachments
    if (messageObj.attachments != null) {
      messageObj.attachments = JSON.stringify(messageObj.attachments);
    }
    try {
      await client.chat.postMessage(messageObj);
    }
    catch (error) {
      logger.debug('Post error', error);
      logger.debug('Sent data to slack is:', messageObj);
      throw error;
    }
  };

  const convertMarkdownToMarkdown = function(body) {
    const url = crowi.appService.getSiteUrl();

    return body
      .replace(/\n\*\s(.+)/g, '\n• $1')
      .replace(/#{1,}\s?(.+)/g, '\n*$1*')
      .replace(/(\[(.+)\]\((https?:\/\/.+)\))/g, '<$3|$2>')
      .replace(/(\[(.+)\]\((\/.+)\))/g, `<${url}$3|$2>`);
  };

  const prepareAttachmentTextForCreate = function(page, user) {
    let body = page.revision.body;
    if (body.length > 2000) {
      body = `${body.substr(0, 2000)}...`;
    }

    return convertMarkdownToMarkdown(body);
  };

  const prepareAttachmentTextForUpdate = function(page, user, previousRevision) {
    const diff = require('diff');
    let diffText = '';

    diff.diffLines(previousRevision.body, page.revision.body).forEach((line) => {
      logger.debug('diff line', line);
      const value = line.value.replace(/\r\n|\r/g, '\n'); // eslint-disable-line no-unused-vars
      if (line.added) {
        diffText += `${line.value} ... :lower_left_fountain_pen:`;
      }
      else if (line.removed) {
        // diffText += '-' + line.value.replace(/(.+)?\n/g, '- $1\n');
        // 1以下は無視
        if (line.count > 1) {
          diffText += `:wastebasket: ... ${line.count} lines\n`;
        }
      }
      else {
        // diffText += '...\n';
      }
    });

    logger.debug('diff is', diffText);

    return diffText;
  };

  const prepareAttachmentTextForComment = function(comment) {
    let body = comment.comment;
    if (body.length > 2000) {
      body = `${body.substr(0, 2000)}...`;
    }

    if (comment.isMarkdown) {
      return convertMarkdownToMarkdown(body);
    }

    return body;
  };

  const prepareSlackMessageForPage = function(page, user, channel, updateType, previousRevision) {
    const appTitle = crowi.appService.getAppTitle();
    const url = crowi.appService.getSiteUrl();
    let body = page.revision.body;

    if (updateType === 'create') {
      body = prepareAttachmentTextForCreate(page, user);
    }
    else {
      body = prepareAttachmentTextForUpdate(page, user, previousRevision);
    }

    const attachment = {
      color: '#263a3c',
      author_name: `@${user.username}`,
      author_link: urljoin(url, 'user', user.username),
      author_icon: user.image,
      title: page.path,
      title_link: urljoin(url, page.id),
      text: body,
      mrkdwn_in: ['text'],
    };
    if (user.image) {
      attachment.author_icon = user.image;
    }

    const message = {
      channel: (channel != null) ? `#${channel}` : undefined,
      username: appTitle,
      text: getSlackMessageTextForPage(page.path, page.id, user, updateType),
      attachments: [attachment],
    };

    return message;
  };

  const prepareSlackMessageForComment = function(comment, user, channel, path) {
    const appTitle = crowi.appService.getAppTitle();
    const url = crowi.appService.getSiteUrl();
    const body = prepareAttachmentTextForComment(comment);

    const attachment = {
      color: '#263a3c',
      author_name: `@${user.username}`,
      author_link: urljoin(url, 'user', user.username),
      author_icon: user.image,
      text: body,
      mrkdwn_in: ['text'],
    };
    if (user.image) {
      attachment.author_icon = user.image;
    }

    const message = {
      channel: (channel != null) ? `#${channel}` : undefined,
      username: appTitle,
      text: getSlackMessageTextForComment(path, String(comment.page), user),
      attachments: [attachment],
    };

    return message;
  };

  /**
   * For GlobalNotification
   *
   * @param {string} messageBody
   * @param {string} attachmentBody
   * @param {string} slackChannel
  */
  const prepareSlackMessageForGlobalNotification = async(messageBody, attachmentBody, slackChannel) => {
    const appTitle = crowi.appService.getAppTitle();

    const attachment = {
      color: '#263a3c',
      text: attachmentBody,
      mrkdwn_in: ['text'],
    };

    const message = {
      channel: (slackChannel != null) ? `#${slackChannel}` : undefined,
      username: appTitle,
      text: messageBody,
      attachments: [attachment],
    };

    return message;
  };

  const getSlackMessageTextForPage = function(path, pageId, user, updateType) {
    let text;
    const url = crowi.appService.getSiteUrl();

    const pageUrl = `<${urljoin(url, pageId)}|${path}>`;
    if (updateType === 'create') {
      text = `:rocket: ${user.username} created a new page! ${pageUrl}`;
    }
    else {
      text = `:heavy_check_mark: ${user.username} updated ${pageUrl}`;
    }

    return text;
  };

  const getSlackMessageTextForComment = function(path, pageId, user) {
    const url = crowi.appService.getSiteUrl();
    const pageUrl = `<${urljoin(url, pageId)}|${path}>`;
    const text = `:speech_balloon: ${user.username} commented on ${pageUrl}`;

    return text;
  };

  // slack.post = function (channel, message, opts) {
  slack.postPage = (page, user, channel, updateType, previousRevision) => {
    const messageObj = prepareSlackMessageForPage(page, user, channel, updateType, previousRevision);

    return slackPost(messageObj);
  };

  slack.postComment = (comment, user, channel, path) => {
    const messageObj = prepareSlackMessageForComment(comment, user, channel, path);

    return slackPost(messageObj);
  };

  slack.sendGlobalNotification = async(messageBody, attachmentBody, slackChannel) => {
    const messageObj = await prepareSlackMessageForGlobalNotification(messageBody, attachmentBody, slackChannel);

    return slackPost(messageObj);
  };

  const slackPost = (messageObj) => {
    // when incoming Webhooks is prioritized
    if (configManager.getConfig('notification', 'slack:isIncomingWebhookPrioritized')) {
      if (configManager.getConfig('notification', 'slack:incomingWebhookUrl')) {
        logger.debug('posting message with IncomingWebhook');
        return postWithIwh(messageObj);
      }
      if (configManager.getConfig('notification', 'slack:token')) {
        logger.debug('posting message with Web API');
        return postWithWebApi(messageObj);
      }
    }
    // else
    else {
      if (configManager.getConfig('notification', 'slack:token')) {
        logger.debug('posting message with Web API');
        return postWithWebApi(messageObj);
      }
      if (configManager.getConfig('notification', 'slack:incomingWebhookUrl')) {
        logger.debug('posting message with IncomingWebhook');
        return postWithIwh(messageObj);
      }
    }
  };

  return slack;
};
