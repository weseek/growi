import mongoose from 'mongoose';
import { getModelSafely, getMongoUri, mongoOptions } from '@growi/core';

import getPageModel from '~/server/models/page';
import PageRedirectModel from '~/server/models/page-redirect';
import loggerFactory from '~/utils/logger';
import { createBatchStream } from '~/server/util/batch-stream';

const logger = loggerFactory('growi:migrate:convert-redirect-to-pages-to-page-redirect-documents');

const BATCH_SIZE = 100;


module.exports = {
  async up(db, client) {
    mongoose.connect(getMongoUri(), mongoOptions);
    const Page = getModelSafely('Page') || getPageModel();
    const PageRedirect = getModelSafely('PageRedirect') || PageRedirectModel;

    const cursor = Page.find({ redirectTo: { $ne: null } }, { path: 1, redirectTo: 1, _id: 0 }).cursor();
    const batchStream = createBatchStream(BATCH_SIZE);

    // redirectTo => PageRedirect
    for await (const pages of cursor.pipe(batchStream)) {
      const insertPageRedirectOperations = pages.map((page) => {
        return {
          insertOne: {
            document: {
              fromPath: page.path,
              toPath: page.redirectTo,
            },
          },
        };
      });

      await PageRedirect.bulkWrite(insertPageRedirectOperations);
    }

    await Page.deleteMany({ redirectTo: { $ne: null } });

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    mongoose.connect(getMongoUri(), mongoOptions);
    const Page = getModelSafely('Page') || getPageModel();
    const PageRedirect = getModelSafely('PageRedirect') || PageRedirectModel;

    const cursor = PageRedirect.find().cursor();
    const batchStream = createBatchStream(BATCH_SIZE);

    // PageRedirect => redirectTo
    for await (const pageRedirects of cursor.pipe(batchStream)) {
      const insertRedirectToPageOperations = pageRedirects.map((pageRedirect) => {
        return {
          insertOne: {
            document: {
              path: pageRedirect.fromPath,
              redirectTo: pageRedirect.toPath,
            },
          },
        };
      });

      await Page.bulkWrite(insertRedirectToPageOperations);
    }

    await PageRedirect.deleteMany();

    logger.info('Migration down has successfully applied');
  },
};
