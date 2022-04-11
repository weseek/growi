import { getModelSafely, getMongoUri, mongoOptions } from '@growi/core';
import mongoose from 'mongoose';

import getUserModel from '~/server/models/user';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:drop-pages-indices');

/**
 * set sparce true to slackMemberId
 */
// const updateSlackMemberIdScheme = async(db, updateIdList) => {
//   await db.collection('pagetagrelations').updateMany(
//     { relatedPage: { $in: updateIdList } },
//     { $set: { isPageTrashed: true } },
//   );
// };

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);
    const User = getModelSafely('User') || getUserModel();

    // User.User

    await db.collection('users').updateMany(
      {},
      { $set: { slackMemberId: { sparse: true } } },
    );


    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
