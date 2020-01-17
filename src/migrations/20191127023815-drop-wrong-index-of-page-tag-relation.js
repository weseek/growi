require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:drop-wrong-index-of-page-tag-relation');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

async function dropIndexIfExists(db, collectionName, indexName) {
  // check existence of the collection
  const items = await db.listCollections({ name: collectionName }, { nameOnly: true }).toArray();
  if (items.length === 0) {
    return;
  }

  const collection = await db.collection(collectionName);
  if (await collection.indexExists(indexName)) {
    await collection.dropIndex(indexName);
  }
}

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    await dropIndexIfExists(db, 'pagetagrelations', 'page_1_user_1');

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
