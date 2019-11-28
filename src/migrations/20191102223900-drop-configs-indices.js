require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:drop-configs-indices');

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

    const collection = db.collection('configs');
    await dropIndexIfExists(collection, 'ns_1');
    await dropIndexIfExists(collection, 'key_1');

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
