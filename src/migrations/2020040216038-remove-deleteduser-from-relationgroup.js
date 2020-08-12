import mongoose from 'mongoose';

import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';
import { getModelSafely } from '~/utils/mongoose-utils';

const logger = loggerFactory('growi:migrate:remove-deleteduser-from-relationgroup');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const User = getModelSafely('User') || require('~/server/models/user')();
    const UserGroupRelation = getModelSafely('UserGroupRelation') || require('~/server/models/user-group-relation')();

    const deletedUsers = await User.find({ status: 4 }); // deleted user
    const requests = await UserGroupRelation.remove({ relatedUser: deletedUsers });

    if (requests.size === 0) {
      return logger.info('This migration terminates without any changes.');
    }
    logger.info('Migration has successfully applied');

  },

  down(db) {
    // do not rollback
  },
};
