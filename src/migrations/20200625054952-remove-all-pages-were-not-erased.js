const logger = require('@alias/logger')('growi:migrate:remove-all-pages-were-not-erased');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db) {
    logger.info('Start migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Page = getModelSafely('Page') || require('@server/models/page')();
    // https://regex101.com/r/BSDdRr/1
    await Page.deleteMany({ redirectTo: { $in: /^\/trash(\/.*)?$/ } });


    await mongoose.disconnect();

    logger.info('Migration has successfully terminated');
  },

  down(db) {
    // do not rollback
  },
};
