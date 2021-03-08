import mongoose from 'mongoose';

import Config from '~/server/models/config';
import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:update-theme-color-for-dark');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    await Promise.all([
      await Config.findOneAndUpdate({ key: 'customize:theme', value: JSON.stringify('default-dark') }, { value: JSON.stringify('default') }), // update default-dark
      await Config.findOneAndUpdate({ key: 'customize:theme', value: JSON.stringify('blue-night') }, { value: JSON.stringify('mono-blue') }), // update blue-night
    ]);

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    // do not rollback
  },
};
