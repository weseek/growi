require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:update-mail-transmission');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    await Config.create({
      ns: 'crowi',
      key: 'mail:transmissionMethod',
      value: 'smtp',
    });

    /* const smtpExist = await Config.findOne({
      ns: 'crowi',
      key: 'mail:smtpUser',
    });

    const sesExist = await Config.findOne({
      ns: 'crowi',
      key: 'mail:sesAccessKeyId',
    });

    const requestColumn = {ns: 'crowi', key: 'mail:transmissionMethod'};

    if (smtpExist != null) {
      requestColumn.value = 'smpt';
    }
    else if (sesExist != null) {
      requestColumn.value = 'ses';
    }
    else {
      await Config.create({
        ns: 'crowi',
        key: 'mail:transmissionMethod',
        value: 'smtp',
      });
    } */

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    // remote 'app:siteUrl'
    await Config.findOneAndDelete({
      ns: 'crowi',
      key: 'mail:transmissionMethod',
    });

    logger.info('Migration has been successfully rollbacked');
  },
};
