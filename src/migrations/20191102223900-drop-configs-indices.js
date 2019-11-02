require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:drop-configs-indices');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const collection = db.collection('configs');
    await collection.dropIndex('ns_1');
    await collection.dropIndex('key_1');

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
