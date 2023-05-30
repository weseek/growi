import mongoose from 'mongoose';

import { getModelSafely, getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:migrate:slack-app-integration-rename-keys');

module.exports = {
  async up(db) {
    mongoose.connect(getMongoUri(), mongoOptions);

    const SlackAppIntegration = getModelSafely('SlackAppIntegration') || require('~/server/models/slack-app-integration')();

    const slackAppIntegrations = await SlackAppIntegration.find();

    if (slackAppIntegrations.length === 0) return;

    // create operations
    const operations = slackAppIntegrations.map((doc) => {
      const permissionsForSingleUseCommands = doc._doc.permissionsForSingleUseCommands;
      const createValue = permissionsForSingleUseCommands.get('create', false);
      const togetterValue = permissionsForSingleUseCommands.get('togetter', false);

      const newPermissionsForSingleUseCommands = {
        note: createValue,
        keep: togetterValue,
      };

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              permissionsForSingleUseCommands: newPermissionsForSingleUseCommands,
            },
          },
        },
      };
    });

    await db.collection('slackappintegrations').bulkWrite(operations);

    logger.info('Migration has successfully applied');
  },

  async down(db, next) {
    mongoose.connect(getMongoUri(), mongoOptions);

    const SlackAppIntegration = getModelSafely('SlackAppIntegration') || require('~/server/models/slack-app-integration')();

    const slackAppIntegrations = await SlackAppIntegration.find();

    if (slackAppIntegrations.length === 0) return next();

    // create operations
    const operations = slackAppIntegrations.map((doc) => {
      const permissionsForSingleUseCommands = doc._doc.permissionsForSingleUseCommands;
      const noteValue = permissionsForSingleUseCommands.get('note', false);
      const keepValue = permissionsForSingleUseCommands.get('keep', false);

      const newPermissionsForSingleUseCommands = {
        create: noteValue,
        togetter: keepValue,
      };

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              permissionsForSingleUseCommands: newPermissionsForSingleUseCommands,
            },
          },
        },
      };
    });

    await db.collection('slackappintegrations').bulkWrite(operations);

    next();
    logger.info('Migration rollback has successfully applied');
  },
};
