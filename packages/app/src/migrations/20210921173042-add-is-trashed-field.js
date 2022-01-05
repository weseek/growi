import mongoose from 'mongoose';

import { getMongoUri, mongoOptions } from '@growi/core';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:add-column-is-trashed');
const Page = require('~/server/models/page')();

const LIMIT = 1000;

/**
 * set isPageTrashed of pagetagrelations included in updateIdList as true
 */
const updateIsPageTrashed = async(db, updateIdList) => {
  await db.collection('pagetagrelations').updateMany(
    { relatedPage: { $in: updateIdList } },
    { $set: { isPageTrashed: true } },
  );
};

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    let updateDeletedPageIds = [];

    // set isPageTrashed as false temporarily
    await db.collection('pagetagrelations').updateMany(
      {},
      { $set: { isPageTrashed: false } },
    );

    for await (const deletedPage of Page.find({ status: Page.STATUS_DELETED }).select('_id').cursor()) {
      updateDeletedPageIds.push(deletedPage._id);
      // excute updateMany by one thousand ids
      if (updateDeletedPageIds.length === LIMIT) {
        await updateIsPageTrashed(db, updateDeletedPageIds);
        updateDeletedPageIds = [];
      }
    }

    // use ids that have not been updated
    if (updateDeletedPageIds.length > 0) {
      await updateIsPageTrashed(db, updateDeletedPageIds);
    }

    logger.info('Migration has successfully applied');

  },

  async down(db) {
    logger.info('Rollback migration');
    mongoose.connect(getMongoUri(), mongoOptions);

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
