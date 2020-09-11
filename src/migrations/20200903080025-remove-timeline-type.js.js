require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:remove-behavior-type');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    await Config.findOneAndDelete({ key: 'customize:timeline' }); // remove timeline

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    // do not rollback
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    const insertConfig = new Config({
      ns: 'crowi',
      key: 'customize:timeline',
      value: true,
    });

    await insertConfig.save();

    logger.info('Migration has been successfully rollbacked');
  },
};
