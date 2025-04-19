import mongoose from 'mongoose';

import getPageModel from '~/server/models/page';
import { getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:adjust-page-grant');

module.exports = {

  async up(_db) {
    logger.info('Apply migration');
    await mongoose.connect(getMongoUri(), mongoOptions);

    const Page = getPageModel();

    await Page.bulkWrite([
      {
        updateMany:
         {
           filter: { grant: null },
           update: { $set: { grant: Page.GRANT_PUBLIC } },
         },
      },
    ]);

    logger.info('Migration has successfully applied');

  },

  down(_db) {
    // do not rollback
  },
};
