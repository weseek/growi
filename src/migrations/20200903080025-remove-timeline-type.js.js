import loggerFactory from '~/utils/logger';

import Config from '~/server/models/config';

const logger = loggerFactory('growi:migrate:remove-timeline-type');

const mongoose = require('mongoose');
const config = require('^/config/migrate');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    await Config.findOneAndDelete({ key: 'customize:isEnabledTimeline' }); // remove timeline

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    // do not rollback
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const insertConfig = new Config({
      ns: 'crowi',
      key: 'customize:isEnabledTimeline',
      value: true,
    });

    await insertConfig.save();

    logger.info('Migration has been successfully rollbacked');
  },
};
