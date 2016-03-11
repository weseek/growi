/**
 * slack
 */

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('crowi:util:slack'),
    Config = crowi.model('Config'),
    Botkit = require('botkit'),
    slack = {};
  slack.controller = undefined;

  slack.createBot = function() {
    var bot;
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

  return slack;
};
