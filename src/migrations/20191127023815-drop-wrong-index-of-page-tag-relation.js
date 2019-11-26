require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:drop-wrong-index-of-page-tag-relation');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

async function dropIndexIfExists(collection, indexName) {
  if (await collection.indexExists(indexName)) {
    await collection.dropIndex(indexName);
  }
}

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const collection = db.collection('pagetagrelations');
    await dropIndexIfExists(collection, 'page_1_user_1');

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
