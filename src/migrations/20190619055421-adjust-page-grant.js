require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:adjust-page-grant');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

module.exports = {

  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Page = require('@server/models/page')();

    await Page.bulkWrite([
      {
        updateMany:
         {
           filter: { grant: null },
           update: { $set: { grant: Page.GRANT_PUBLIC } },
           upsert: true,
         },
      },
    ]);

    logger.info('Migration has successfully applied');

  },

  down(db) {
    // do not rollback
  },
};
