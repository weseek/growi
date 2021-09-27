import mongoose from 'mongoose';

import Config from '~/server/models/config';
import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:update-configs-for-slackbot');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    await Config.bulkWrite([
      {
        updateOne: {
          filter: { key: 'slackbot:proxyServerUri' },
          update: { key: 'slackbot:proxyUri' },
        },
      },
      {
        updateOne: {
          filter: { key: 'slackbot:token' },
          update: { key: 'slackbot:withoutProxy:botToken' },
        },
      },
      {
        updateOne: {
          filter: { key: 'slackbot:signingSecret' },
          update: { key: 'slackbot:withoutProxy:signingSecret' },
        },
      },
    ]);

    logger.info('Migration has successfully applied');
  },

  async down(db) {
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    await Config.bulkWrite([
      {
        updateOne: {
          filter: { key: 'slackbot:proxyUri' },
          update: { key: 'slackbot:proxyServerUri' },
        },
      },
      {
        updateOne: {
          filter: { key: 'slackbot:withoutProxy:botToken' },
          update: { key: 'slackbot:token' },
        },
      },
      {
        updateOne: {
          filter: { key: 'slackbot:withoutProxy:signingSecret' },
          update: { key: 'slackbot:signingSecret' },
        },
      },
    ]);

    logger.info('Migration has successfully applied');
  },
};
