/**
 * slack
 */

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('crowi:util:slack'),
    Config = crowi.model('Config'),
    Botkit = require('botkit'),
    sprintf = require('sprintf'),
    bot = null,
    slack = {};
  slack.controller = undefined;

  slack.createBot = function() {
    // alreay created
    if (bot) {
      return bot;
    }

    var config = crowi.getConfig();

    if (!slack.controller) {
      slack.configureSlackApp();
    }

    if (!slack.controller) {
      return false;
    }

    if (Config.hasSlackToken(config)) {
      bot = slack.controller.spawn({token: config.notification['slack:token']});
    } else {
      bot = slack.controller.spawn();
    }
    return bot;
  };

  slack.configureSlackApp = function ()
  {
    var config = crowi.getConfig();
    if (Config.hasSlackConfig(config)) {
      slack.controller = Botkit.slackbot();
      slack.controller.configureSlackApp({
        clientId: config.notification['slack:clientId'],
        clientSecret: config.notification['slack:clientSecret'],
        redirectUri: slack.getSlackAuthCallbackUrl(),
        scopes: ['chat:write:bot']
      });

      return true;
    }

    return false;
  }

  // hmmm
  slack.getSlackAuthCallbackUrl = function()
  {
    var config = crowi.getConfig();
    // Web アクセスがきてないと app:url がセットされないので crowi.setupSlack 時にはできない
    // cli, bot 系作るときに問題なりそう
    return (config.crowi['app:url'] || '') + '/admin/notification/slackAuth';
  }

  slack.getAuthorizeURL = function () {
    if (!slack.controller) {
      slack.configureSlackApp();
    }

    if (!slack.controller) {
      return '';
    }

    return slack.controller.getAuthorizeURL();
  }

  slack.post = function (message) {
    var bot = slack.createBot();

    return new Promise(function(resolve, reject) {
      bot.api.chat.postMessage(message, function(err, res) {
        if (err) {
          debug('Post error', err, res);
          debug('Sent data to slack is:', message);
          return reject(err);
        }

        resolve(res);
      });
    });
  };

  slack.convertMarkdownToMrkdwn = function(body) {
    var config = crowi.getConfig();
    var url = '';
    if (config.crowi && config.crowi['app:url']) {
      url = config.crowi['app:url'];
    }

    body = body
      .replace(/\n\*\s(.+)/g, '\n• $1')
      .replace(/#{1,}\s?(.+)/g, '\n*$1*')
      .replace(/(\[(.+)\]\((https?:\/\/.+)\))/g, '<$3|$2>')
      .replace(/(\[(.+)\]\((\/.+)\))/g, '<' + url + '$3|$2>')
      ;

    return body;
  };

  slack.prepareAttachmentTextForCreate = function(page, user) {
    var body = page.revision.body;
    if (body.length > 2000) {
      body = body.substr(0, 2000) + '...';
    }

    return this.convertMarkdownToMrkdwn(body);
  };

  slack.prepareAttachmentTextForUpdate = function(page, user, previousRevision) {
    var diff = require('diff');
    var diffText = ''

    diff.diffLines(previousRevision.body, page.revision.body).forEach(function(line) {
      debug('diff line', line)
      var value = line.value.replace(/\r\n|\r/g, '\n');
      if (line.added) {
        diffText += sprintf(':pencil2: ...\n%s', line.value);
      } else if (line.removed) {
        // diffText += '-' + line.value.replace(/(.+)?\n/g, '- $1\n');
        // 1以下は無視
        if (line.count > 1) {
          diffText += sprintf(':wastebasket: ... %s lines\n', line.count);
        }
      } else {
        //diffText += '...\n';
      }
    });

    debug('diff is', diffText)

    return diffText;
  };

  slack.prepareSlackMessage = function(page, user, channel, updateType, previousRevision) {
    var config = crowi.getConfig();
    var url = config.crowi['app:url'] || '';
    var body = page.revision.body;

    if (updateType == 'create') {
      body = this.prepareAttachmentTextForCreate(page, user);
    } else {
      body = this.prepareAttachmentTextForUpdate(page, user, previousRevision);
    }

    var attachment = {
      color: '#263a3c',
      author_name: '@' + user.username,
      author_link: url + '/user/' + user.username,
      author_icon: user.image,
      title: page.path,
      title_link: url + '/' + page._id,
      text: body,
      mrkdwn_in: ["text"],
    };
    if (user.image) {
      attachment.author_icon = user.image;
    }

    var message = {
      channel: '#' + channel,
      username: 'Crowi',
      text: this.getSlackMessageText(page.path, user, updateType),
      attachments: [attachment],
    };

    return message;
  };

  slack.getSlackMessageText = function(path, user, updateType) {
    var text;

    if (updateType == 'create') {
      text = sprintf(':white_check_mark: %s created a new page! %s', user.username, path);
    } else {
      text = sprintf(':up: %s updated %s', user.username, path);
    }

    return text;
  };

  return slack;
};
