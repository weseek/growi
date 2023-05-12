import mongoose from 'mongoose';

// eslint-disable-next-line import/no-named-as-default
import Config from '~/server/models/config';
import { getModelSafely, getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:normalize-locale-id');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const User = getModelSafely('User') || require('~/server/models/user')();

    await Promise.all([
      // update en-US -> en_US
      Config.updateOne(
        { key: 'app:globalLang', value: JSON.stringify('en-US') },
        { value: JSON.stringify('en_US') },
      ),
      // update ja -> ja_JP
      Config.update(
        { key: 'app:globalLang', value: JSON.stringify('ja') },
        { value: JSON.stringify('ja_JP') },
      ),

      // update en-US -> en_US
      User.updateMany(
        { lang: 'en-US' },
        { lang: 'en_US' },
      ),
      // update ja -> ja_JP
      User.updateMany(
        { lang: 'ja' },
        { lang: 'ja_JP' },
      ),
    ]);

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    // do not rollback
  },
};
