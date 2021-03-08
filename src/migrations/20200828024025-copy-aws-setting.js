import mongoose from 'mongoose';

import Config from '~/server/models/config';
import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:remove-layout-setting');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const [accessKeyId, secretAccessKey] = await Promise.all([
      Config.findOne({ key: 'aws:accessKeyId' }),
      Config.findOne({ key: 'aws:secretAccessKey' }),
    ]);

    const request = [];

    if (accessKeyId != null) {
      if (accessKeyId.value != null) {
        request.push({
          insertOne: {
            document: {
              key: 'mail:sesAccessKeyId',
              ns: 'crowi',
              value: accessKeyId.value,
            },
          },
        });
      }
    }

    if (secretAccessKey != null) {
      if (secretAccessKey.value != null) {
        request.push({
          insertOne: {
            document: {
              key: 'mail:sesSecretAccessKey',
              ns: 'crowi',
              value: secretAccessKey.value,
            },
          },
        });
      }
    }

    if (request.length > 0) {
      await Config.bulkWrite(request);
    }

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    await Config.deleteMany({ key: { $in: ['mail:sesAccessKeyId', 'mail:sesSecretAccessKey'] } });

    logger.info('Migration has been successfully rollbacked');
  },
};
