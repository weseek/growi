import mongoose from 'mongoose';

import { getModelSafely, getMongoUri, mongoOptions } from '@growi/core';
import loggerFactory from '~/utils/logger';
import getPageModel from '~/server/models/page';


const logger = loggerFactory('growi:migrate:revision-path-to-page-id-schema-migration');

const LIMIT = 300;

module.exports = {
  // path => pageId
  async up(db, client) {
    mongoose.connect(getMongoUri(), mongoOptions);
    const Page = getModelSafely('Page') || getPageModel();
    const Revision = getModelSafely('Revision') || require('~/server/models/revision')();

    const recursiveUpdate = async(offset = 0) => {
      const pages = await Page.find({ revision: { $ne: null } }, { _id: 1, revision: 1 }).skip(offset).limit(LIMIT).exec();
      if (pages.length === 0) {
        return;
      }
      const updateManyOperations = pages.map((page) => {
        return {
          updateMany: {
            filter: { _id: page.revision },
            update: [
              {
                $unset: ['path'],
              },
              {
                $set: { pageId: page._id },
              },
            ],
          },
        };
      });
      await Revision.bulkWrite(updateManyOperations);
      await recursiveUpdate(offset + LIMIT);
    };

    await recursiveUpdate();

    logger.info('Migration has successfully applied');
  },

  // pageId => path
  async down(db, client) {
    mongoose.connect(getMongoUri(), mongoOptions);
    const Page = getModelSafely('Page') || getPageModel();
    const Revision = getModelSafely('Revision') || require('~/server/models/revision')();

    const recursiveUpdate = async(offset = 0) => {
      const pages = await Page.find({ revision: { $ne: null } }, { _id: 1, revision: 1, path: 1 }).skip(offset).limit(LIMIT).exec();
      if (pages.length === 0) {
        return;
      }

      // make map revisionId to pageId
      const updateManyOperations = pages.map((page) => {
        return {
          updateMany: {
            filter: { _id: page.revision },
            update: [
              {
                $unset: ['pageId'],
              },
              {
                $set: { path: page.path },
              },
            ],
          },
        };
      });

      // updateMany by array
      await Revision.bulkWrite(updateManyOperations);
      await recursiveUpdate(offset + LIMIT);
    };

    await recursiveUpdate();

    logger.info('Migration down has successfully applied');
  },
};
