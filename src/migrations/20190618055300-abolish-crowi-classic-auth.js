const logger = require('@alias/logger')('growi:migrate:abolish-crowi-classic-auth');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');


module.exports = {
  async up(db, next) {
    logger.info('Start migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    // enable passport and delete configs for crowi classic auth
    await Promise.all([
      Config.findOneAndUpdate(
        { ns: 'crowi', key: 'security:isEnabledPassport' },
        { ns: 'crowi', key: 'security:isEnabledPassport', value: JSON.stringify(true) },
        { upsert: true },
      ),
      Config.deleteOne({ ns: 'crowi', key: 'google:clientId' }),
      Config.deleteOne({ ns: 'crowi', key: 'google:clientSecret' }),
    ]);

    logger.info('Migration has successfully terminated');
    next();
  },

  async down(db, next) {
    // do not rollback
    next();
  },
};
