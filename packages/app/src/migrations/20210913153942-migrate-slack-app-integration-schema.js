import mongoose from 'mongoose';
import { defaultSupportedCommandsNameForBroadcastUse, defaultSupportedCommandsNameForSingleUse } from '@growi/slack';

import config from '^/config/migrate';
import loggerFactory from '~/utils/logger';
import { getModelSafely } from '~/server/util/mongoose-utils';


const logger = loggerFactory('growi:migrate:update-configs-for-slackbot');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const SlackAppIntegration = getModelSafely('SlackAppIntegration') || require('~/server/models/slack-app-integration')();

    const slackAppIntegrations = await SlackAppIntegration.find();

    // create default data
    const defaultDataForBroadcastUse = {};
    defaultSupportedCommandsNameForBroadcastUse.forEach((commandName) => {
      defaultDataForBroadcastUse[commandName] = false;
    });
    const defaultDataForSingleUse = {};
    defaultSupportedCommandsNameForSingleUse.forEach((commandName) => {
      defaultDataForSingleUse[commandName] = false;
    });

    // create operations
    const operations = slackAppIntegrations.map((doc) => {
      const copyForBroadcastUse = { ...defaultDataForBroadcastUse };
      const copyForSingleUse = { ...defaultDataForSingleUse };
      // when the document does NOT have supportedCommandsFor... columns
      if (doc._doc.supportedCommandsForBroadcastUse == null) {
        defaultSupportedCommandsNameForBroadcastUse.forEach((commandName) => {
          copyForBroadcastUse[commandName] = true;
        });
        defaultSupportedCommandsNameForSingleUse.forEach((commandName) => {
          copyForSingleUse[commandName] = true;
        });
      }
      // // when the document has supportedCommandsFor... columns
      else {
        doc._doc.supportedCommandsForBroadcastUse.forEach((commandName) => {
          copyForBroadcastUse[commandName] = true;
        });
        doc._doc.supportedCommandsForSingleUse.forEach((commandName) => {
          copyForSingleUse[commandName] = true;
        });
      }

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: [
            {
              $set: {
                permissionsForBroadcastUseCommands: copyForBroadcastUse,
                permissionsForSingleUseCommands: copyForSingleUse,
              },
            },
            {
              $unset: ['supportedCommandsForBroadcastUse', 'supportedCommandsForSingleUse'],
            },
          ],
        },
      };
    });

    await SlackAppIntegration.bulkWrite(operations);

    logger.info('Migration has successfully applied');
  },

  async down(db, next) {
    logger.info('Rollback migration');
    // return next();
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const SlackAppIntegration = getModelSafely('SlackAppIntegration') || require('~/server/models/slack-app-integration')();

    const slackAppIntegrations = await SlackAppIntegration.find();

    // create operations
    const operations = slackAppIntegrations.map((doc) => {
      const dataForBroadcastUse = [];
      const dataForSingleUse = [];
      doc.permissionsForBroadcastUseCommands.forEach((value, commandName) => {
        if (value === true) {
          dataForBroadcastUse.push(commandName);
        }
      });
      doc.permissionsForSingleUseCommands.forEach((value, commandName) => {
        if (value === true) {
          dataForSingleUse.push(commandName);
        }
      });

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: [
            {
              $set: {
                supportedCommandsForBroadcastUse: dataForBroadcastUse,
                supportedCommandsForSingleUse: dataForSingleUse,
              },
            },
            {
              $unset: ['permissionsForBroadcastUseCommands', 'permissionsForSingleUseCommands'],
            },
          ],
        },
      };
    });

    await SlackAppIntegration.bulkWrite(operations);

    next();
    logger.info('Migration has successfully applied');
  },
};
