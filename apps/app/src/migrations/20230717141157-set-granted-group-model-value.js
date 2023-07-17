import mongoose from 'mongoose';

import { getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:remove-basic-auth-related-config');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');

    mongoose.connect(getMongoUri(), mongoOptions);
    const pageCollection = await db.collection('pages');

    // Set the model type of grantedGroup to UserGroup
    // for Pages that were created before ExternalUserGroup was introduced
    pageCollection.updateMany(
      { grantedGroupModel: null },
      { $set: { grantedGroupModel: 'UserGroup' } },
    );

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    logger.info('Rollback migration');

    mongoose.connect(getMongoUri(), mongoOptions);
    const pageCollection = await db.collection('pages');

    pageCollection.updateMany(
      { grantedGroupModel: 'UserGroup' },
      { $set: { grantedGroupModel: null } },
    );

    logger.info('Migration has been successfully rollbacked');
  },
};
