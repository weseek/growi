import mongoose from 'mongoose';

import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:add-column-is-trashed');
const Page = require('~/server/models/page')();

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const deletedPageStatusQuery = { status: Page.STATUS_DELETED };

    const PAGE_COUNT = await Page.count(deletedPageStatusQuery);
    const OFFSET = 1000;
    let skip = 0;

    const deletedPagesPromises = [];
    const addFieldRequests = [];

    while (PAGE_COUNT > skip) {
      deletedPagesPromises.push(Page.find(deletedPageStatusQuery).select('_id').skip(skip).limit(OFFSET));
      skip += OFFSET;
    }

    for await (const deletedPages of deletedPagesPromises) {
      const deletedPageIdList = deletedPages.map(deletedPage => deletedPage._id);
      addFieldRequests.push(
        {
          updateMany: {
            filter: { relatedPage: { $in: deletedPageIdList } },
            update: { $set: { isPageTrashed: true } },
          },
        },
        {
          updateMany: {
            filter: { relatedPage: { $nin: deletedPageIdList } },
            update: { $set: { isPageTrashed: false } },
          },
        },
      );
    }

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
