import mongoose from 'mongoose';
import { getModelSafely, getMongoUri, mongoOptions } from '@growi/core';

import ConfigModel from '~/server/models/config';
import { PageDeleteConfigValue } from '~/interfaces/page-delete-config';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:convert-page-delete-config');


module.exports = {
  async up(db, client) {
    mongoose.connect(getMongoUri(), mongoOptions);
    const Config = getModelSafely('Config') || ConfigModel;

    const oldConfig = await Config.findOne({
      ns: 'crowi',
      key: 'security:pageCompleteDeletionAuthority',
    });

    const oldValue = oldConfig?.value || '"anyOne"';
    const newValue = oldValue === '"anyOne"' ? `"${PageDeleteConfigValue.Anyone}"` : oldConfig.value;

    try {
      await Config.updateOne(
        {
          ns: 'crowi',
          key: 'security:pageCompleteDeletionAuthority',
        },
        { value: newValue },
      );

      await Config.insertMany(
        [
          {
            ns: 'crowi',
            key: 'security:pageDeletionAuthority',
            value: newValue,
          },
          {
            ns: 'crowi',
            key: 'security:pageRecursiveDeletionAuthority',
            value: `"${PageDeleteConfigValue.Inherit}"`,
          },
          {
            ns: 'crowi',
            key: 'security:pageRecursiveCompleteDeletionAuthority',
            value: `"${PageDeleteConfigValue.Inherit}"`,
          },
        ],
      );
    }
    catch (err) {
      logger.error('Failed to migrate page delete configs', err);
      throw err;
    }

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    mongoose.connect(getMongoUri(), mongoOptions);
    const Config = getModelSafely('Config') || ConfigModel;

    await Config.deleteMany({
      ns: 'crowi',
      key: { $in: ['security:pageDeletionAuthority', 'security:pageRecursiveDeletionAuthority', 'security:pageRecursiveCompleteDeletionAuthority'] },
    });

    const beforeVersionConfig = await Config.findOne({
      ns: 'crowi',
      key: 'security:pageCompleteDeletionAuthority',
    });

    if (beforeVersionConfig?.value === `"${PageDeleteConfigValue.Anyone}"`) {
      await Config.updateOne({
        ns: 'crowi',
        key: 'security:pageCompleteDeletionAuthority',
      }, {
        value: '"anyOne"', // 'anyone' to 'anyOne'
      });
    }

    logger.info('Migration down has successfully applied');
  },
};
