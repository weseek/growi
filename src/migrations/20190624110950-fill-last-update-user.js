require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:abolish-page-group-relation');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

module.exports = {

  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    /*
    await db.collection('pages').aggregate([
      {
        $match: {
          $or: [
            { lastUpdateUser: { $exists: false } },
            { lastUpdateUser: { $eq: null } },
          ],
        },
      },
      {
        $addFields: {
          lastUpdateUser: '$creator',
        },
      },
    ])
      .out('pages')
      .toArray();

    */

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },

};
