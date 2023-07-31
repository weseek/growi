// eslint-disable-next-line import/no-named-as-default
import Config from '~/server/models/config';
import User from '~/server/models/user';
import { getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:remove-presentation-configurations');

const mongoose = require('mongoose');

module.exports = {
  async up() {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const appInstalled = await Config.findOne({ key: 'app:installed' });
    if (appInstalled != null && appInstalled.createdAt == null) {
      const initialUser = await User.find().limit(1).sort({ createdAt: 1 });
      appInstalled.createdAt = initialUser.createdAt;
      await appInstalled.save();
    }

    logger.info('Migration has successfully applied');
  },

  async down() {
    logger.info('Rollback migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const appInstalled = await Config.findOne({ key: 'app:installed' });
    if (appInstalled != null) {
      appInstalled.createdAt = null;

      await appInstalled.save();
    }

    logger.info('Migration has been successfully rollbacked');
  },
};
