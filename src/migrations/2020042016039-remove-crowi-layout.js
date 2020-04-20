require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:remove-deleteduser-from-relationgroup');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    const query = { key: 'customize:layout', value: JSON.stringify('crowi') };

    await Config.findOneAndUpdate(query, { value: JSON.stringify('growi') }); // update layout

    logger.info('Migration has successfully');
  },

  down(db) {
    // do not rollback
  },
};
