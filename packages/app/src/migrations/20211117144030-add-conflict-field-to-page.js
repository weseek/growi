import mongoose from 'mongoose';

import { getMongoUri, mongoOptions } from '@growi/core';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:add-conflict-field-to-page');

module.exports = {
  async up(db) {
    mongoose.connect(getMongoUri(), mongoOptions);

    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    await db.collection('pages').updateMany(
      {},
      { $set: { hasConflictRevision: false, conflictRevisions: null } },
    );

    logger.info('Migration has successfully applied');
  },

  async down(db) {
    logger.info('Rollback migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    await db.collection('pages').updateMany(
      {},
      { $unset: { hasConflictRevision: '', conflictRevisions: '' } },
    );

    logger.info('Migration rollback has successfully applied');
  },
};
