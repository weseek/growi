import mongoose from 'mongoose';

import {
  PageRecursiveDeleteConfigValue, PageRecursiveDeleteCompConfigValue,
} from '~/interfaces/page-delete-config';
import ConfigModel from '~/server/models/config';
import { getModelSafely, getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:convert-page-delete-config');


module.exports = {
  async up(db, client) {
    mongoose.connect(getMongoUri(), mongoOptions);
    const Config = getModelSafely('Config') || ConfigModel;

    const isNewConfigExists = await Config.count({
      ns: 'crowi',
      key: 'security:pageDeletionAuthority',
    }) > 0;

    if (isNewConfigExists) {
      logger.info('This migration is skipped because new configs are existed.');
      logger.info('Migration has successfully applied');
      return;
    }

    const oldConfig = await Config.findOne({
      ns: 'crowi',
      key: 'security:pageCompleteDeletionAuthority',
    });

    const oldValue = oldConfig?.value ?? '"anyOne"';

    try {

      await Config.insertMany(
        [
          {
            ns: 'crowi',
            key: 'security:pageDeletionAuthority',
            value: oldValue,
          },
          {
            ns: 'crowi',
            key: 'security:pageRecursiveDeletionAuthority',
            value: `"${PageRecursiveDeleteConfigValue.Inherit}"`,
          },
          {
            ns: 'crowi',
            key: 'security:pageRecursiveCompleteDeletionAuthority',
            value: `"${PageRecursiveDeleteCompConfigValue.Inherit}"`,
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
    logger.info('Migration down has successfully applied');
  },
};
