import mongoose from 'mongoose';

import Config from '~/server/models/config';
import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:abolish-crowi-classic-auth');

module.exports = {
  async up(db, next) {
    logger.info('Start migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    // enable passport and delete configs for crowi classic auth
    await Promise.all([
      Config.findOneAndUpdate(
        { ns: 'crowi', key: 'security:isEnabledPassport' },
        { ns: 'crowi', key: 'security:isEnabledPassport', value: JSON.stringify(true) },
        { upsert: true },
      ),
      Config.findOneAndUpdate(
        { ns: 'crowi', key: 'google:clientId' },
        { ns: 'crowi', key: 'google:clientId', value: JSON.stringify(null) },
        { upsert: true },
      ),
      Config.findOneAndUpdate(
        { ns: 'crowi', key: 'google:clientSecret' },
        { ns: 'crowi', key: 'google:clientSecret', value: JSON.stringify(null) },
        { upsert: true },
      ),
    ]);

    logger.info('Migration has successfully terminated');
    next();
  },

  async down(db, next) {
    // do not rollback
    next();
  },
};
