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

  function initialize() {
    // SMTP 設定がある場合はそれを優先
    //if config.crowi

    // AWS 設定がある場合はSESを設定
    var ses = require('nodemailer-ses-transport');
    var transporter = nodemailer.createTransport(ses({
        accessKeyId: 'AWSACCESSKEY',
        secretAccessKey: 'AWS/Secret/key'
    }));
  }

  function setupMailConfig (overrideConfig) {
    var c = overrideConfig
      , mc = {}
      ;
    mc = mailConfig;

    mc.from = c.from || mailConfig.from;
    mc.subject = c.subject || mailConfig.subject;

    return mc;
  }


  initialize();
  return mailer;
};
