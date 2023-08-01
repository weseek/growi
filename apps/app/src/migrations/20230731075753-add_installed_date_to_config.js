// eslint-disable-next-line import/no-named-as-default
import ConfigModel from '~/server/models/config';
import { getModelSafely, getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:migration:add-installed-date-to-config');

const mongoose = require('mongoose');

module.exports = {
  async up() {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);
    const Config = getModelSafely('Config') || ConfigModel;
    const User = getModelSafely('User') || require('~/server/models/user')();

    const appInstalled = await Config.findOne({ key: 'app:installed' });
    if (appInstalled != null && appInstalled.createdAt == null) {
      // Get the oldest user who probably installed this GROWI.
      const users = await User.find().limit(1).sort({ createdAt: 1 });
      const initialUserCreatedAt = users[0].createdAt;
      logger.debug('initialUserCreatedAt: ', initialUserCreatedAt);
      const updatedConfig = await Config.findOneAndUpdate({ _id: appInstalled._id }, { createdAt: initialUserCreatedAt }, {
        new: true,
        timestamps: false,
        strict: false,
      });
      logger.debug('updatedConfig: ', updatedConfig);
    }

    logger.info('Migration has successfully applied');
  },

  async down() {
    logger.info('Rollback migration');
    mongoose.connect(getMongoUri(), mongoOptions);
    const Config = getModelSafely('Config') || ConfigModel;

    const appInstalled = await Config.findOne({ key: 'app:installed' });
    if (appInstalled != null) {
      const updatedConfig = await Config.findOneAndUpdate({ _id: appInstalled._id }, { $unset: { createdAt: 1 } }, {
        new: true,
        timestamps: false,
        strict: false,
      });
      logger.debug('updatedConfig: ', updatedConfig);
    }

    logger.info('Migration has been successfully rollbacked');
  },
};
