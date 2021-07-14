require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:update-theme-color-for-dark');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    await Promise.all([
      await Config.findOneAndUpdate({ key: 'customize:theme', value: JSON.stringify('default-dark') }, { value: JSON.stringify('default') }), // update default-dark
      await Config.findOneAndUpdate({ key: 'customize:theme', value: JSON.stringify('blue-night') }, { value: JSON.stringify('mono-blue') }), // update blue-night
    ]);

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    // do not rollback
  },
};
