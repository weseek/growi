import mongoose from 'mongoose';

import { getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:remove-basic-auth-related-config');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');

    mongoose.connect(getMongoUri(), mongoOptions);
    const pageCollection = await db.collection('pages');
    const pageOperationCollection = await db.collection('pageoperations');

    // Set the model type of grantedGroup to UserGroup
    // for Pages that were created before ExternalUserGroup was introduced
    pageCollection.updateMany(
      { grantedGroupModel: null },
      { $set: { grantedGroupModel: 'UserGroup' } },
    );
    // Set the model type of grantUserGroupIdModel to UserGroup
    // for PageOperations that were created before ExternalUserGroup was introduced
    pageOperationCollection.updateMany(
      { 'options.grantUserGroupIdModel': null },
      { $set: { 'options.grantUserGroupIdModel': 'UserGroup' } },
    );

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    logger.info('Rollback migration');

    mongoose.connect(getMongoUri(), mongoOptions);
    const pageCollection = await db.collection('pages');
    const pageOperationCollection = await db.collection('pageoperations');

    pageCollection.updateMany(
      { grantedGroupModel: 'UserGroup' },
      { $set: { grantedGroupModel: null } },
    );
    pageOperationCollection.updateMany(
      { 'options.grantUserGroupIdModel': 'UserGroup' },
      { $set: { 'options.grantUserGroupIdModel': null } },
    );

    logger.info('Migration has been successfully rollbacked');
  },
};
