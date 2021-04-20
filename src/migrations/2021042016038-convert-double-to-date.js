require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:remove-deleteduser-from-relationgroup');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Page = getModelSafely('Page') || require('@server/models/page')();

    // const pages = await Page.count({
    //   updatedAt: { $type: 'double' },
    // });
    const pages = await Page.aggregate(
      [{
        $match: {
          updatedAt: { $type: 'double' },
        },

      },
       {
         $addFields: {
           convertedDate: { $toDate: '$updatedAt' },
         },
       }],
    );

    console.log(pages, pages.length);

    // await Page.bulkWrite([
    //   {
    //     updateMany:
    //      {
    //        filter: { updatedAt: { $type: 'double' } },
    //        update: { updatedAt: { $convert: { input: 'updatedAt', to: 'date' } } },
    //      },
    //   },
    // ]);

    logger.info('Migration has successfully applied');

  },

  down(db) {
    // do not rollback
  },
};
