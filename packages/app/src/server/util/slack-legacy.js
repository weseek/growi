const debug = require('debug')('growi:util:slack');
// const slack = require('./slack');

/**
 * slack
 */

/* eslint-disable no-use-before-define */

module.exports = function(crowi) {
  const { IncomingWebhook } = require('@slack/webhook');
  const { WebClient } = require('@slack/web-api');

  const { configManager } = crowi;
  const slack = crowi.getSlack();

  const slackLegacy = {};

  const postWithIwh = async(messageObj) => {
    const webhook = new IncomingWebhook(configManager.getConfig('notification', 'slack:incomingWebhookUrl'));
    try {
      await webhook.send(messageObj);
    }
    catch (error) {
      debug('Post error', error);
      debug('Sent data to slack is:', messageObj);
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
      debug('Post error', error);
      debug('Sent data to slack is:', messageObj);
      throw error;
    }
  };

  // slackLegacy.post = function (channel, message, opts) {
  slackLegacy.postPage = (page, user, channel, updateType, previousRevision) => {
    const messageObj = slack.prepareSlackMessageForPage(page, user, channel, updateType, previousRevision);

    return slackPost(messageObj);
  };

  slackLegacy.postComment = (comment, user, channel, path) => {
    const messageObj = slack.prepareSlackMessageForComment(comment, user, channel, path);

    return slackPost(messageObj);
  };

  slackLegacy.sendGlobalNotification = async(messageBody, attachmentBody, slackChannel) => {
    const messageObj = await slack.prepareSlackMessageForGlobalNotification(messageBody, attachmentBody, slackChannel);

    return slackPost(messageObj);
  };

  const slackPost = (messageObj) => {
    // when incoming Webhooks is prioritized
    if (configManager.getConfig('notification', 'slack:isIncomingWebhookPrioritized')) {
      if (configManager.getConfig('notification', 'slack:incomingWebhookUrl')) {
        debug('posting message with IncomingWebhook');
        return postWithIwh(messageObj);
      }
      if (configManager.getConfig('notification', 'slack:token')) {
        debug('posting message with Web API');
        return postWithWebApi(messageObj);
      }
    }
    // else
    else {
      if (configManager.getConfig('notification', 'slack:token')) {
        debug('posting message with Web API');
        return postWithWebApi(messageObj);
      }
      if (configManager.getConfig('notification', 'slack:incomingWebhookUrl')) {
        debug('posting message with IncomingWebhook');
        return postWithIwh(messageObj);
      }
    }
  };

  return slackLegacy;
};
