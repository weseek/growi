'use strict';

require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:abolish-page-group-relation');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

module.exports = {

  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Page = require('@server/models/page')();
    const UserGroup = require('@server/models/user-group')();

    // retrieve all documents from 'pagegrouprelations'
    const relations = await db.collection('pagegrouprelations').find().toArray();

    for (let relation of relations) {
      const page = await Page.findOne({ _id: relation.targetPage });

      // skip if grant mismatch
      if (page.grant !== Page.GRANT_USER_GROUP) {
        continue;
      }

      const userGroup = await UserGroup.findOne({ _id: relation.relatedGroup });

      // skip if userGroup does not exist
      if (userGroup == null) {
        continue;
      }

      page.grantedGroup = userGroup;
      await page.save();
    }

    // drop collection
    await db.collection('pagegrouprelations').drop();

    logger.info('Migration has successfully applied');
  },

  async down(db) {
    logger.info('Undo migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Page = require('@server/models/page')();
    const UserGroup = require('@server/models/user-group')();

    // retrieve all Page documents which granted by UserGroup
    const relatedPages = await Page.find({ grant: Page.GRANT_USER_GROUP });
    const insertDocs = [];
    for (let page of relatedPages) {
      if (page.grantedGroup == null) {
        continue;
      }

      const userGroup = await UserGroup.findOne({ _id: page.grantedGroup });

      // skip if userGroup does not exist
      if (userGroup == null) {
        continue;
      }

      // create a new document for 'pagegrouprelations' collection that is managed by mongoose
      insertDocs.push({
        targetPage: page._id,
        relatedGroup: userGroup._id,
        __v: 0,
      });

      // clear 'grantedGroup' field
      page.grantedGroup = undefined;
      await page.save();
    }

    await db.collection('pagegrouprelations').insertMany(insertDocs);

    logger.info('Migration has successfully undoed');
  }

};
