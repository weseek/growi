import { getMongoUri, mongoOptions } from '@growi/core';
import loggerFactory from '~/utils/logger';

import Config from '~/server/models/config';

const logger = loggerFactory('growi:migrate:update-mail-transmission-fix');

const mongoose = require('mongoose');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const transmissionMethod = await Config.findOne({
      ns: 'crowi',
      key: 'mail:transmissionMethod',
    });

    if (transmissionMethod == null) {
      return logger.info('No need to change.');
    }

    transmissionMethod.value = JSON.stringify(transmissionMethod.value);
    await transmissionMethod.save();

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    // do not rollback
  },
};
