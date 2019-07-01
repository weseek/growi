require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:make-root-page-public');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Page = require('@server/models/page')();

    await Page.findOneAndUpdate(
      { path: '/' },
      {
        grant: Page.GRANT_PUBLIC,
        grantedUsers: [],
        grantedGroup: null,
      },
    );

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
