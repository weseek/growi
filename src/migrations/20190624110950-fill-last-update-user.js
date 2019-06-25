require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:abolish-page-group-relation');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

/**
 * FIX https://github.com/weseek/growi/issues/1067
 */
module.exports = {

  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Page = require('@server/models/page')();

    // see https://stackoverflow.com/questions/3974985/update-mongodb-field-using-value-of-another-field/37280419#37280419

    // retrieve target data
    const pages = await Page.find({
      $or: [
        { lastUpdateUser: { $exists: false } },
        { lastUpdateUser: { $eq: null } },
      ],
    }).select('_id creator');

    // create requests for bulkWrite
    const requests = pages.map((page) => {
      return {
        updateOne: {
          filter: { _id: page._id },
          update: { $set: { lastUpdateUser: page.creator } },
        },
      };
    });

    if (requests.length > 0) {
      await db.collection('pages').bulkWrite(requests);
    }

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },

};
