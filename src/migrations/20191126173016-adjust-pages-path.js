import mongoose from 'mongoose';
import { pathUtils } from 'growi-commons';

import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:adjust-pages-path');


module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Page = require('~/server/models/page')();

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
