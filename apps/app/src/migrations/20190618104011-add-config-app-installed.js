import mongoose from 'mongoose';

// eslint-disable-next-line import/no-named-as-default
import Config from '~/server/models/config';
import { getModelSafely, getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:add-config-app-installed');

/**
 * BEFORE
 *   - Config document { ns: 'crowi', key: 'app:installed' } does not exist
 * AFTER
 *   - Config document { ns: 'crowi', key: 'app:installed' } is created
 *     - value will be true if one or more users exist
 *     - value will be false if no users exist
 */
module.exports = {

  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const User = getModelSafely('User') || require('~/server/models/user')();

    // find 'app:siteUrl'
    const appInstalled = await Config.findOne({
      ns: 'crowi',
      key: 'app:installed',
    });
    // exit if exists
    if (appInstalled != null) {
      logger.info('\'app:appInstalled\' is already exists. This migration terminates without any changes.');
      return;
    }

    const userCount = await User.count();

    if (userCount > 0) {
      await Config.create({
        ns: 'crowi',
        key: 'app:installed',
        value: true,
      });
    }

    logger.info('Migration has successfully applied');
  },

  async down(db) {
    logger.info('Rollback migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    // remote 'app:siteUrl'
    await Config.findOneAndDelete({
      ns: 'crowi',
      key: 'app:installed',
    });

    logger.info('Migration has been successfully rollbacked');
  },
};
