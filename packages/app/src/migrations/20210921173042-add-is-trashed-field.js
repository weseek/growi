import mongoose from 'mongoose';

import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:add-column-is-trashed');
const Page = require('~/server/models/page')();

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const pages = await Page.find({});

    // create requests for bulkWrite
    const requests = pages.map((page) => {
      return {
        updateMany: {
          filter: { relatedPage: page._id },
          update: { $set: { isPageTrashed: page.status === Page.STATUS_DELETED } },
        },
      };
    });

    if (requests.length > 0) {
      await db.collection('pagetagrelations').bulkWrite(requests);
      // throw new Error('error!');
    }

    logger.info('Migration has successfully applied');
  },

  async down(db) {
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const pages = await Page.find({});

    // create requests for bulkWrite
    const requests = pages.map((page) => {
      return {
        updateMany: {
          filter: { relatedPage: page._id },
          update: { $unset: { isPageTrashed: '' } },
        },
      };
    });

    if (requests.length > 0) {
      await db.collection('pagetagrelations').bulkWrite(requests);
    }

    logger.info('Migration has been successfully rollbacked');

  },
};
