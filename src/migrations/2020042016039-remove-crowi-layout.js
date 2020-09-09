import mongoose from 'mongoose';

import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';
import { getModelSafely } from '~/server/util/mongoose-utils';

const logger = loggerFactory('growi:migrate:remove-crowi-lauout');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('~/server/models/config')();

    const query = { key: 'customize:layout', value: JSON.stringify('crowi') };

    await Config.findOneAndUpdate(query, { value: JSON.stringify('growi') }); // update layout

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
