require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:remove-layout-setting');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

// const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    logger.info('Migration has been successfully rollbacked');
  },
};
