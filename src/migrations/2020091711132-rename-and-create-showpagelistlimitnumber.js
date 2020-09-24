require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:rename-showrecentcreatednumber-to-showpagelistlimitnumber');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    // const Config = getModelSafely('Config') || require('@server/models/config')();

    // await Config.findOneAndUpdate(
    //   { ns: 'crowi', key: 'customize:showRecentCreatedNumber' },
    //   { ns: 'crowi', key: 'customize:A' },
    //   { upsert: true },
    // );

    // Config.save([
    //   { ns: 'crowi', key: 'customize:B', value: 10 },
    //   { ns: 'crowi', key: 'customize:B', value: 10 },
    // ]);
    // Config.update();
    // Config.update({ ns: 'crowi', key: 'customize:C' }, { value: 10 }, { upsert: true });
    // Config.update({ ns: 'crowi', key: 'customize:D' }, { value: 10 }, { upsert: true });

    logger.info('Migration has successfully applied');
  },

  async down(db) {
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    await Config.findOneAndUpdate(
      { ns: 'crowi', key: 'customize:A' },
      { ns: 'crowi', key: 'customize:showRecentCreatedNumber' },
      { upsert: true },
    );

    logger.info('Migration has successfully applied');
  },
};
