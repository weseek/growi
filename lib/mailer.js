/**
 * mailer
 */

module.exports = function(app) {
  'use strict';

  var debug = require('debug')('crowi:lib:mailer')
    , nodemailer = require("nodemailer")
    , config = app.set('config')
    , mailConfig = {}
    , mailer = {}
    ;


  function createSmtpClient(option)
  {
    var client;

    debug('createSmtpClient option', option);
    if (!option) {
      option = {
        host: config.crowi['mail:smtpHost'],
        port: config.crowi['mail:smtpPort'],
        auth: {
          user: config.crowi['mail:smtpUser'],
          pass: config.crowi['mail:smtpPassword']
        }
      };
      if (option.port === 465) {
        option.secure = true;
      }
    }

    client = nodemailer.createTransport(option);
    return client;
  }

  function createSESClient(option)
  {
    var client;

    if (!option) {
      option = {
        accessKeyId: config.crowi['aws:accessKeyId'],
        secretAccessKey: config.crowi['aws:secretAccessKey']
      };
    }

    var ses = require('nodemailer-ses-transport');
    var client = nodemailer.createTransport(ses(option));

    return client;
  }

  function initialize() {
    if (!config.crowi['mail.from']) {
      mailer = undefined;
      return;
    }

    if (config.crowi['mail:smtpUser']
        && config.crowi['mail:smtpPassword']
        && config.crowi['mail:smtpHost']
        && config.crowi['mail:smtpPort']
      ) {
      // SMTP 設定がある場合はそれを優先
      mailer = createSmtpClient();

    } else if (config.crowi['aws:accessKeyId'] && config.crowi['aws:secretAccessKey']) {
      // AWS 設定がある場合はSESを設定
      mailer = createSESClient();
    } else {
      mailer = undefined;
    }

    mailConfig.from = config.crowi['mail.from'];
    mailConfig.subject = config.crowi['app:title'] + 'からのメール';
  }

  function setupMailConfig (overrideConfig) {
    var c = overrideConfig
      , mc = {}
      ;
    mc = mailConfig;

    mc.to      = c.to;
    mc.to      = 'Sotaro <sotarok@crocos.co.jp>'; // for test
    mc.from    = c.from || mailConfig.from;
    mc.from    = 'Crowi <reg@sotaro-k.com>'; // for test
    mc.text    = c.text;
    mc.subject = c.subject || mailConfig.subject;

    return mc;
  }

  function send(config, callback) {
    if (mailer) {
      mailer.sendMail(setupMailConfig(config));
    } else {
      debug('Mailer is not completed to set up. Please set up SMTP or AWS setting.');
      callback(new Error('Mailer is not completed to set up. Please set up SMTP or AWS setting.'), null);
    }
  }


  initialize();

  return {
    createSmtpClient: createSmtpClient,
    createSESClient: createSESClient,
    mailer: mailer,
    send: send,
  };
};
