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

    const sesExist = await Config.findOne({
      ns: 'crowi',
      key: 'mail:sesAccessKeyId',
    });

    if (sesExist == null) {
      return logger.info('Failed to migrate');
    }
    if (sesExist.value != null) {
      await Config.create({
        ns: 'crowi',
        key: 'mail:transmissionMethod',
        value: 'ses',
      });
    }
    else {
      await Config.create({
        ns: 'crowi',
        key: 'mail:transmissionMethod',
        value: 'smtp',
      });
    }

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
