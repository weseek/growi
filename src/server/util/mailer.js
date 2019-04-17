/**
 * mailer
 */

module.exports = function(crowi) {
  const debug = require('debug')('growi:lib:mailer');
  const nodemailer = require('nodemailer');
  const swig = require('swig-templates');
  const Config = crowi.model('Config');
  const config = crowi.getConfig();
  const mailConfig = {};

  let mailer = {};

  function createSMTPClient(option) {
    debug('createSMTPClient option', option);
    if (!option) {
      option = { // eslint-disable-line no-param-reassign
        host: config.crowi['mail:smtpHost'],
        port: config.crowi['mail:smtpPort'],
      };

      if (config.crowi['mail:smtpUser'] && config.crowi['mail:smtpPassword']) {
        option.auth = {
          user: config.crowi['mail:smtpUser'],
          pass: config.crowi['mail:smtpPassword'],
        };
      }
      if (option.port === 465) {
        option.secure = true;
      }
    }
    option.tls = { rejectUnauthorized: false };

    const client = nodemailer.createTransport(option);

    debug('mailer set up for SMTP', client);
    return client;
  }

  function createSESClient(option) {
    if (!option) {
      option = { // eslint-disable-line no-param-reassign
        accessKeyId: config.crowi['aws:accessKeyId'],
        secretAccessKey: config.crowi['aws:secretAccessKey'],
      };
    }

    const ses = require('nodemailer-ses-transport');
    const client = nodemailer.createTransport(ses(option));

    debug('mailer set up for SES', client);
    return client;
  }

  function initialize() {
    if (!config.crowi['mail:from']) {
      mailer = undefined;
      return;
    }

    if (config.crowi['mail:smtpHost'] && config.crowi['mail:smtpPort']
    ) {
      // SMTP 設定がある場合はそれを優先
      mailer = createSMTPClient();
    }
    else if (config.crowi['aws:accessKeyId'] && config.crowi['aws:secretAccessKey']) {
      // AWS 設定がある場合はSESを設定
      mailer = createSESClient();
    }
    else {
      mailer = undefined;
    }

    mailConfig.from = config.crowi['mail:from'];
    mailConfig.subject = `${Config.appTitle(config)}からのメール`;

    debug('mailer initialized');
  }

  function setupMailConfig(overrideConfig) {
    const c = overrideConfig;


    let mc = {};
    mc = mailConfig;

    mc.to = c.to;
    mc.from = c.from || mailConfig.from;
    mc.text = c.text;
    mc.subject = c.subject || mailConfig.subject;

    return mc;
  }

  function send(config, callback) {
    if (mailer) {
      const templateVars = config.vars || {};
      return swig.renderFile(
        config.template,
        templateVars,
        (err, output) => {
          if (err) {
            throw err;
          }

          config.text = output;
          return mailer.sendMail(setupMailConfig(config), callback);
        },
      );
    }

    debug('Mailer is not completed to set up. Please set up SMTP or AWS setting.');
    return callback(new Error('Mailer is not completed to set up. Please set up SMTP or AWS setting.'), null);
  }


  initialize();

  return {
    createSMTPClient,
    createSESClient,
    mailer,
    send,
  };
};
