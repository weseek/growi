require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:rename-showrecentcreatednumber-to-showpagelistlimitnumber');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    await Config.findOneAndUpdate(
      { ns: 'crowi', key: 'customize:showRecentCreatedNumber' },
      { ns: 'crowi', key: 'customize:showPageListLimitNumber' },
      { upsert: true },
    );

    logger.info('Migration has successfully applied');
  },

  async down(db) {
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    await Config.findOneAndUpdate(
      { ns: 'crowi', key: 'customize:showPageListLimitNumber' },
      { ns: 'crowi', key: 'customize:showRecentCreatedNumber' },
      { upsert: true },
    );
  },
};
