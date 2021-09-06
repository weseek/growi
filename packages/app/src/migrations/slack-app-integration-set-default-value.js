import mongoose from 'mongoose';

import { defaultSupportedCommandsNameForBroadcastUse, defaultSupportedCommandsNameForSingleUse } from '@growi/slack';
import { getModelSafely } from '~/server/util/mongoose-utils';
import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:slack-app-integration-set-default-value');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const defaultValuesForBroadcastUse = defaultSupportedCommandsNameForBroadcastUse.map(commandName => [commandName, true]);
    const defaultValuesForSingleUse = defaultSupportedCommandsNameForSingleUse.map(commandName => [commandName, true]);

    await db.collection('slackappintegrations').updateMany(
      {},
      [
        {
          $set: {
            permissionsForBroadcastUseCommands: new Map(defaultValuesForBroadcastUse),
            permissionsForSingleUseCommands: new Map(defaultValuesForSingleUse),
          },
        },
        {
          $unset: ['supportedCommandsForSingleUse', 'supportedCommandsForBroadcastUse'],
        },
      ],
    );

    logger.info('Migration has successfully applied');
  },

  async down(db, next) {
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    await db.collection('slackappintegrations').updateMany(
      {},
      [
        {
          $set: {
            supportedCommandsForBroadcastUse: defaultSupportedCommandsNameForBroadcastUse,
            supportedCommandsForSingleUse: defaultSupportedCommandsNameForSingleUse,
          },
        },
        {
          $unset: ['permissionsForBroadcastUseCommands', 'permissionsForSingleUseCommands'],
        },
      ],
    );
    next();
  },
};
