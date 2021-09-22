import mongoose from 'mongoose';

import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:add-column-is-trashed');
const Page = require('~/server/models/page')();

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const deletedPages = await Page.find({ status: Page.STATUS_DELETED });
    const deletedPageList = deletedPages.map(deletedPage => deletedPage._id);

    const addFieldRequests = [
      {
        updateMany: {
          filter: { relatedPage: { $in: deletedPageList } },
          update: { $set: { isPageTrashed: true } },
        },
      },
      {
        updateMany: {
          filter: { relatedPage: { $nin: deletedPageList } },
          update: { $set: { isPageTrashed: false } },
        },
      },
    ];

    try {
      await db.collection('pagetagrelations').bulkWrite(addFieldRequests);
      logger.info('Migration has successfully applied');
    }
    catch (err) {
      logger.error(err);
      logger.info('Migration has failed');
    }

  },

  async down(db) {
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    try {
      await db.collection('pagetagrelations').updateMany(
        {},
        { $unset: { isPageTrashed: '' } },
      );
      logger.info('Migration has been successfully rollbacked');
    }
    catch (err) {
      logger.error(err);
      logger.info('Migration has failed');
    }

  },
};
