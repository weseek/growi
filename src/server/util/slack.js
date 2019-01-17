/**
 * slack
 */

module.exports = function(crowi) {
  'use strict';

  const debug = require('debug')('growi:util:slack'),
    config = crowi.getConfig(),
    Config = crowi.model('Config'),
    Slack = require('slack-node'),
    slack = {};

  const postWithIwh = function(messageObj) {
    return new Promise((resolve, reject) => {
      const client = new Slack();
      client.setWebhook(config.notification['slack:incomingWebhookUrl']);
      client.webhook(messageObj, function(err, res) {
        if (err) {
          debug('Post error', err, res);
          debug('Sent data to slack is:', messageObj);
          return reject(err);
        }
        resolve(res);
      });
    });
  };

  const postWithWebApi = function(messageObj) {
    return new Promise((resolve, reject) => {
      const client = new Slack(config.notification['slack:token']);
      // stringify attachments
      if (messageObj.attachments != null) {
        messageObj.attachments = JSON.stringify(messageObj.attachments);
      }
      client.api('chat.postMessage', messageObj, function(err, res) {
        if (err) {
          debug('Post error', err, res);
          debug('Sent data to slack is:', messageObj);
          return reject(err);
        }
        resolve(res);
      });
    });
  };

  const convertMarkdownToMarkdown = function(body) {
    var url = '';
    if (config.crowi && config.crowi['app:siteUrl:fixed']) {
      url = config.crowi['app:siteUrl:fixed'];
    }

    body = body
      .replace(/\n\*\s(.+)/g, '\n• $1')
      .replace(/#{1,}\s?(.+)/g, '\n*$1*')
      .replace(/(\[(.+)\]\((https?:\/\/.+)\))/g, '<$3|$2>')
      .replace(/(\[(.+)\]\((\/.+)\))/g, '<' + url + '$3|$2>')
    ;

    return body;
  };

  const prepareAttachmentTextForCreate = function(page, user) {
    var body = page.revision.body;
    if (body.length > 2000) {
      body = body.substr(0, 2000) + '...';
    }

    return convertMarkdownToMarkdown(body);
  };

  const prepareAttachmentTextForUpdate = function(page, user, previousRevision) {
    var diff = require('diff');
    var diffText = '';

    diff.diffLines(previousRevision.body, page.revision.body).forEach(function(line) {
      debug('diff line', line);
      /* eslint-disable no-unused-vars */
      var value = line.value.replace(/\r\n|\r/g, '\n');
      /* eslint-enable */
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
        //diffText += '...\n';
      }
    });

    debug('diff is', diffText);

    return diffText;
  };

  const prepareAttachmentTextForComment = function(comment) {
    let body = comment.comment;
    if (body.length > 2000) {
      body = body.substr(0, 2000) + '...';
    }

    if (comment.isMarkdown) {
      return convertMarkdownToMarkdown(body);
    }
    else {
      return body;
    }
  };

  const prepareSlackMessageForPage = function(page, user, channel, updateType, previousRevision) {
    const url = config.crowi['app:siteUrl:fixed'] || '';
    let body = page.revision.body;

    if (updateType == 'create') {
      body = prepareAttachmentTextForCreate(page, user);
    }
    else {
      body = prepareAttachmentTextForUpdate(page, user, previousRevision);
    }

    const attachment = {
      color: '#263a3c',
      author_name: '@' + user.username,
      author_link: url + '/user/' + user.username,
      author_icon: user.image,
      title: page.path,
      title_link: url + '/' + page._id,
      text: body,
      mrkdwn_in: ['text'],
    };
    if (user.image) {
      attachment.author_icon = user.image;
    }

    const message = {
      channel: '#' + channel,
      username: Config.appTitle(config),
      text: getSlackMessageTextForPage(page.path, user, updateType),
      attachments: [attachment],
    };

    return message;
  };

  const prepareSlackMessageForComment = function(comment, user, channel, path) {
    const url = config.crowi['app:siteUrl:fixed'] || '';
    const body = prepareAttachmentTextForComment(comment);

    const attachment = {
      color: '#263a3c',
      author_name: '@' + user.username,
      author_link: url + '/user/' + user.username,
      author_icon: user.image,
      text: body,
      mrkdwn_in: ['text'],
    };
    if (user.image) {
      attachment.author_icon = user.image;
    }

    const message = {
      channel: '#' + channel,
      username: Config.appTitle(config),
      text: getSlackMessageTextForComment(path, user),
      attachments: [attachment],
    };

    return message;
  };

  const getSlackMessageTextForPage = function(path, user, updateType) {
    let text;
    const url = config.crowi['app:siteUrl:fixed'] || '';

    const pageUrl = `<${url}${path}|${path}>`;
    if (updateType == 'create') {
      text = `:rocket: ${user.username} created a new page! ${pageUrl}`;
    }
    else {
      text = `:heavy_check_mark: ${user.username} updated ${pageUrl}`;
    }

    return text;
  };

  const getSlackMessageTextForComment = function(path, user) {
    const url = config.crowi['app:siteUrl:fixed'] || '';
    const pageUrl = `<${url}${path}|${path}>`;
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

  const slackPost = (messageObj) => {
    // when incoming Webhooks is prioritized
    if (Config.isIncomingWebhookPrioritized(config)) {
      if (Config.hasSlackIwhUrl(config)) {
        debug('posting message with IncomingWebhook');
        return postWithIwh(messageObj);
      }
      else if (Config.hasSlackToken(config)) {
        debug('posting message with Web API');
        return postWithWebApi(messageObj);
      }
    }
    // else
    else {
      if (Config.hasSlackToken(config)) {
        debug('posting message with Web API');
        return postWithWebApi(messageObj);
      }
      else if (Config.hasSlackIwhUrl(config)) {
        debug('posting message with IncomingWebhook');
        return postWithIwh(messageObj);
      }
    }
  };

  return slack;
};
