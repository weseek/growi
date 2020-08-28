require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:remove-layout-setting');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    const [accessKeyId, secretAccessKey] = await Promise.all([
      Config.findOne({ key: 'aws:accessKeyId' }),
      Config.findOne({ key: 'aws:secretAccessKey' }),
    ]);

    const promise = [
      Config.create({
        key: 'mail:sesAccessKeyId',
        ns: 'crowi',
        value: accessKeyId.value,
      }),
      Config.create({
        key: 'mail:sesSecretAccessKey',
        ns: 'crowi',
        value: secretAccessKey.value,
      }),
    ];

    await Promise.all(promise);

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    await Config.deleteMany({ key: { $in: ['mail:sesAccessKeyId', 'mail:sesSecretAccessKey'] } });

    logger.info('Migration has been successfully rollbacked');
  },
};
