require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:drop-pages-indices');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const collection = db.collection('pages');
    await collection.dropIndex('lastUpdateUser_1');
    await collection.dropIndex('liker_1');
    await collection.dropIndex('seenUsers_1');

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
