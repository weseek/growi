import mongoose from 'mongoose';

import userGroupRelation from '~/server/models/user-group-relation';
import { getModelSafely, getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:remove-deleteduser-from-relationgroup');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const User = getModelSafely('User') || require('~/server/models/user')();
    const UserGroupRelation = getModelSafely('UserGroupRelation') || userGroupRelation;

    const deletedUsers = await User.find({ status: 4 }); // deleted user
    const requests = await UserGroupRelation.remove({ relatedUser: deletedUsers });

    if (requests.size === 0) {
      return logger.info('This migration terminates without any changes.');
    }
    logger.info('Migration has successfully applied');

  },

  down(db, next) {
    // do not rollback
    next();
  },
};
