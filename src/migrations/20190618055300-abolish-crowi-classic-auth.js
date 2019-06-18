require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:make-email-unique');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

function getModel(modelName) {
  if (mongoose.modelNames().includes(modelName)) {
    return mongoose.model(modelName);
  }
  return null;
}

module.exports = {
  async up(db, next) {
    logger.info('Start migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModel('Config') || require('@server/models/config')();

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
