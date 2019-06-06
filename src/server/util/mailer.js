/**
 * mailer
 */

module.exports = function(crowi) {
  const debug = require('debug')('growi:lib:mailer');
  const nodemailer = require('nodemailer');
  const swig = require('swig-templates');

  const Config = crowi.model('Config');
  const configManager = crowi.configManager;

  const mailConfig = {};
  let mailer = {};

  function createSMTPClient(option) {
    debug('createSMTPClient option', option);
    if (!option) {
      option = { // eslint-disable-line no-param-reassign
        host: configManager.getConfig('crowi', 'mail:smtpHost'),
        port: configManager.getConfig('crowi', 'mail:smtpPort'),
      };

      if (configManager.getConfig('crowi', 'mail:smtpUser') && configManager.getConfig('crowi', 'mail:smtpPassword')) {
        option.auth = {
          user: configManager.getConfig('crowi', 'mail:smtpUser'),
          pass: configManager.getConfig('crowi', 'mail:smtpPassword'),
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
        accessKeyId: configManager.getConfig('crowi', 'aws:accessKeyId'),
        secretAccessKey: configManager.getConfig('crowi', 'aws:secretAccessKey'),
      };
    }

    const ses = require('nodemailer-ses-transport');
    const client = nodemailer.createTransport(ses(option));

    debug('mailer set up for SES', client);
    return client;
  }

  function initialize() {
    if (!configManager.getConfig('crowi', 'mail:from')) {
      mailer = undefined;
      return;
    }

    if (configManager.getConfig('crowi', 'mail:smtpHost') && configManager.getConfig('crowi', 'mail:smtpPort')
    ) {
      // SMTP 設定がある場合はそれを優先
      mailer = createSMTPClient();
    }
    else if (configManager.getConfig('crowi', 'aws:accessKeyId') && configManager.getConfig('crowi', 'aws:secretAccessKey')) {
      // AWS 設定がある場合はSESを設定
      mailer = createSESClient();
    }
    else {
      mailer = undefined;
    }

    mailConfig.from = configManager.getConfig('crowi', 'mail:from');
    mailConfig.subject = `${Config.appTitle()}からのメール`;

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
