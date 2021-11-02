/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, {
  Schema, Model, Document,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';
import nodePath from 'path';

import { getOrCreateModel } from '@growi/core';
import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';
import { IPage } from '~/interfaces/page';
import { getPageSchema, PageQueryBuilder } from './obsolete-page';

const logger = loggerFactory('growi:models:page');


/*
 * define schema
 */
const GRANT_PUBLIC = 1;
const GRANT_RESTRICTED = 2;
const GRANT_SPECIFIED = 3;
const GRANT_OWNER = 4;
const GRANT_USER_GROUP = 5;
const PAGE_GRANT_ERROR = 1;
const STATUS_PUBLISHED = 'published';
const STATUS_DELETED = 'deleted';

export interface PageDocument extends IPage, Document {}

export interface PageModel extends Model<PageDocument> {
  createEmptyPagesByPaths(paths: string[]): Promise<void>
  getParentIdAndFillAncestors(path: string): Promise<string | null>
}

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new Schema<PageDocument, PageModel>({
  parent: {
    type: ObjectId, ref: 'Page', index: true, default: null,
  },
  isEmpty: { type: Boolean, default: false },
  path: {
    type: String, required: true,
  },
  revision: { type: ObjectId, ref: 'Revision' },
  redirectTo: { type: String, index: true },
  status: { type: String, default: STATUS_PUBLISHED, index: true },
  grant: { type: Number, default: GRANT_PUBLIC, index: true },
  grantedUsers: [{ type: ObjectId, ref: 'User' }],
  grantedGroup: { type: ObjectId, ref: 'UserGroup', index: true },
  creator: { type: ObjectId, ref: 'User', index: true },
  lastUpdateUser: { type: ObjectId, ref: 'User' },
  liker: [{ type: ObjectId, ref: 'User' }],
  seenUsers: [{ type: ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
  slackChannels: { type: String },
  pageIdOnHackmd: { type: String },
  revisionHackmdSynced: { type: ObjectId, ref: 'Revision' }, // the revision that is synced to HackMD
  hasDraftOnHackmd: { type: Boolean }, // set true if revision and revisionHackmdSynced are same but HackMD document has modified
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleteUser: { type: ObjectId, ref: 'User' },
  deletedAt: { type: Date },
}, {
  toJSON: { getters: true },
  toObject: { getters: true },
});
// apply plugins
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);


/*
 * Methods
 */
const collectAncestorPaths = (path: string, ancestorPaths: string[] = []): string[] => {
  const parentPath = nodePath.dirname(path);
  ancestorPaths.push(parentPath);

  if (path !== '/') return collectAncestorPaths(parentPath, ancestorPaths);

  return ancestorPaths;
};

schema.statics.createEmptyPagesByPaths = async function(paths: string[]): Promise<void> {
  // find existing parents
  const builder = new PageQueryBuilder(this.find({}, { _id: 0, path: 1 }));
  const existingPages = await builder
    .addConditionToListByPathsArray(paths)
    .query
    .lean()
    .exec();
  const existingPagePaths = existingPages.map(page => page.path);

  // paths to create empty pages
  const notExistingPagePaths = paths.filter(path => !existingPagePaths.includes(path));

  // insertMany empty pages
  try {
    await this.insertMany(notExistingPagePaths.map(path => ({ path, isEmpty: true })));
  }
  catch (err) {
    logger.error('Failed to insert empty pages.', err);
    throw err;
  }
};

schema.statics.getParentIdAndFillAncestors = async function(path: string): Promise<string | null> {
  const parentPath = nodePath.dirname(path);

  const parent = await this.findOne({ path: parentPath }); // find the oldest parent which must always be the true parent
  if (parent != null) { // fill parents if parent is null
    return parent._id;
  }

  const ancestorPaths = collectAncestorPaths(path); // paths of parents need to be created

  // just create ancestors with empty pages
  await this.createEmptyPagesByPaths(ancestorPaths);

  // find ancestors
  const builder = new PageQueryBuilder(this.find({}, { _id: 1, path: 1 }));
  const ancestors = await builder
    .addConditionToListByPathsArray(ancestorPaths)
    .query
    .lean()
    .exec();


  const ancestorsMap = new Map(); // Map<path, _id>
  ancestors.forEach(page => ancestorsMap.set(page.path, page._id));

  // bulkWrite to update ancestors
  const nonRootAncestors = ancestors.filter(page => page.path !== '/');
  const operations = nonRootAncestors.map((page) => {
    const { path } = page;
    const parentPath = nodePath.dirname(path);
    return {
      updateOne: {
        filter: {
          path,
        },
        update: {
          parent: ancestorsMap.get(parentPath),
        },
      },
    };
  });
  await this.bulkWrite(operations);

  const parentId = ancestorsMap.get(parentPath);
  return parentId;
};

export default (crowi: Crowi): any => {
  // add old page schema methods
  const pageSchema = getPageSchema(crowi);
  schema.methods = { ...pageSchema.methods, ...schema.methods };
  schema.statics = { ...pageSchema.statics, ...schema.statics };


  return getOrCreateModel<PageDocument, PageModel>('Page', schema);
};
