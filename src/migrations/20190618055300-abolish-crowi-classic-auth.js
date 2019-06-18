require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:make-email-unique');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

module.exports = {
  async up(db, next) {
    logger.info('Start migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = mongoose.model('Config');

    // enable passport and delete configs for crowi classic auth
    await Promise.all([
      Config.deleteOne({ ns: 'crowi', key: 'security:isEnabledPassport' }),
      Config.deleteOne({ ns: 'crowi', key: 'google:clientId' }),
      Config.deleteOne({ ns: 'crowi', key: 'google:clientSecret' }),
    ]);

    logger.info('Migration has successfully terminated');
    next();
  },

  down(db, next) {
    // do not rollback
    next();
  },
};
