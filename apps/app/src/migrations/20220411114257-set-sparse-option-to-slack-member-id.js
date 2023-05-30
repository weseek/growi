import mongoose from 'mongoose';

import { getModelSafely, getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:set-sparse-option-to-slack-member-id');

/**
 * set sparse option to slackMemberId
 */
module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const User = getModelSafely('User') || require('~/server/models/user')();
    await User.syncIndexes();

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
