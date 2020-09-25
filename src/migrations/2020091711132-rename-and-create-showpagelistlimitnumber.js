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
      { ns: 'crowi', key: 'customize:pageListLimitationM' },
      { upsert: true },
    );

    await Config.insertMany(
      [
        { ns: 'crowi', key: 'customize:pageListLimitationS', value: 10 },
        { ns: 'crowi', key: 'customize:pageListLimitationL', value: 10 },
        { ns: 'crowi', key: 'customize:pageListLimitationXL', value: 10 },
      ],
    );

    logger.info('Migration has successfully applied');
  },

  async down(db) {
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    await Config.findOneAndUpdate(
      { ns: 'crowi', key: 'customize:pageListLimitationM' },
      { ns: 'crowi', key: 'customize:showRecentCreatedNumber' },
      { upsert: true },
    );

    await Config.remove(
      {
        key: {
          $in: [
            'customize:pageListLimitationS',
            'customize:pageListLimitationL',
            'customize:pageListLimitationXL',
          ],
        },
      },
    );

    logger.info('Migration has successfully applied');
  },
};
