require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:adjust-pages-path');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const pathUtils = require('growi-commons').pathUtils;

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Page = require('@server/models/page')();

    // retrieve target data
    const pages = await Page.find({ path: /^(?!\/)/ });


    // create requests for bulkWrite
    const requests = pages.map((page) => {
      const adjustedPath = pathUtils.addHeadingSlash(page.path);
      return {
        updateOne: {
          filter: { _id: page._id },
          update: { $set: { path: adjustedPath } },
        },
      };
    });

    if (requests.length > 0) {
      await db.collection('pages').bulkWrite(requests);
    }

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
