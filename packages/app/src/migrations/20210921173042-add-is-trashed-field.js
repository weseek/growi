import mongoose from 'mongoose';

import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:add-column-is-trashed');
const Page = require('~/server/models/page')();

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const LIMIT = 1000;
    let updateDeletedPageIds = [];

    // set isPageTrashed as false temporarily
    await db.collection('pagetagrelations').updateMany(
      {},
      { $set: { isPageTrashed: false } },
    );

    let counter = 0;
    for await (const deletedPage of Page.find({ status: Page.STATUS_DELETED }).select('_id').cursor()) {
      counter += 1;
      updateDeletedPageIds.push(deletedPage._id);
      if (counter % LIMIT === 0) {
        try {
          await db.collection('pagetagrelations').updateMany(
            { relatedPage: { $in: updateDeletedPageIds } },
            { $set: { isPageTrashed: true } },
          );
          logger.info('Migration of 1,000 deleted page operations has successfully applied');
        }
        catch (err) {
          logger.error(err);
          logger.info('Migration of 1,000 deleted page operations has failed');
        }
        updateDeletedPageIds = [];
      }
    }

    if (updateDeletedPageIds.length > 0) {
      try {
        await db.collection('pagetagrelations').updateMany(
          { relatedPage: { $in: updateDeletedPageIds } },
          { $set: { isPageTrashed: true } },
        );
        logger.info(`Migration of ${updateDeletedPageIds.length} deleted page operations has successfully applied`);
      }
      catch (err) {
        logger.error(err);
        logger.info(`Migration of ${updateDeletedPageIds.length} deleted page operations has failed`);
      }
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
