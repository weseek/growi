/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, {
  Schema, Model, Document,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';
import nodePath from 'path';
import RE2 from 're2';

import { getOrCreateModel, pagePathUtils } from '@growi/core';
import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';
import { IPage } from '../../interfaces/page';
import { getPageSchema, PageQueryBuilder } from './obsolete-page';

const { isTopPage } = pagePathUtils;

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

export interface PageDocument extends Omit<IPage, '_id'>, Document {}

export interface PageModel extends Model<PageDocument> {
  createEmptyPagesByPaths(paths: string[]): Promise<void>
  getParentIdAndFillAncestors(path: string): Promise<string | null>
  findByPathAndViewer(path: string | null, user, userGroups?, useFindOne?): Promise<PageDocument[]>
  findTargetAndAncestorsByPathOrId(pathOrId: string): Promise<PageDocument[]>
  findChildrenByParentPathOrIdAndViewer(parentPathOrId: string, user, userGroups?): Promise<PageDocument[]>
  findAncestorsChildrenByPathAndViewer(path: string, user, userGroups?): Promise<Record<string, PageDocument[]>>
}

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new Schema<PageDocument, PageModel>({
  parent: {
    type: ObjectId, ref: 'Page', index: true, default: null,
  },
  isEmpty: { type: Boolean, default: false },
  path: {
    type: String, required: true, index: true,
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
  if (isTopPage(path)) return ancestorPaths;

  const parentPath = nodePath.dirname(path);
  ancestorPaths.push(parentPath);
  return collectAncestorPaths(parentPath, ancestorPaths);
};

const hasSlash = (str: string): boolean => {
  return str.includes('/');
};

/*
 * Generate RE2 instance for one level lower path
 */
const generateChildrenRegExp = (path: string): RE2 => {
  // https://regex101.com/r/laJGzj/1
  // ex. /any_level1
  if (isTopPage(path)) return new RE2(/^\/[^/]+$/);

  // https://regex101.com/r/mrDJrx/1
  // ex. /parent/any_child OR /any_level1
  return new RE2(`^${path}(\\/[^/]+)\\/?$`);
};

/*
 * Create empty pages if the page in paths didn't exist
 */
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

/*
 * Find the pages parent and update if the parent exists.
 * If not,
 *   - first   run createEmptyPagesByPaths with ancestor's paths to ensure all the ancestors exist
 *   - second  update ancestor pages' parent
 *   - finally return the target's parent page id
 */
schema.statics.getParentIdAndFillAncestors = async function(path: string): Promise<Schema.Types.ObjectId> {
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
    .addConditionToSortAncestorPages()
    .query
    .lean()
    .exec();


  const ancestorsMap = new Map(); // Map<path, _id>
  ancestors.forEach(page => ancestorsMap.set(page.path, page._id));

  // bulkWrite to update ancestors
  const nonRootAncestors = ancestors.filter(page => !isTopPage(page.path));
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

// Utility function to add viewer condition to PageQueryBuilder instance
const addViewerCondition = async(queryBuilder: PageQueryBuilder, user, userGroups = null): Promise<void> => {
  let relatedUserGroups = userGroups;
  if (user != null && relatedUserGroups == null) {
    const UserGroupRelation: any = mongoose.model('UserGroupRelation');
    relatedUserGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
  }

  queryBuilder.addConditionToFilteringByViewer(user, relatedUserGroups, true);
};

/*
 * Find a page by path and viewer. Pass false to useFindOne to use findOne method.
 */
schema.statics.findByPathAndViewer = async function(
    path: string | null, user, userGroups = null, useFindOne = true,
): Promise<PageDocument | PageDocument[] | null> {
  if (path == null) {
    throw new Error('path is required.');
  }

  const baseQuery = useFindOne ? this.findOne({ path }) : this.find({ path });
  const queryBuilder = new PageQueryBuilder(baseQuery);
  await addViewerCondition(queryBuilder, user, userGroups);

  return queryBuilder.query.exec();
};


/*
 * Find all ancestor pages by path. When duplicate pages found, it uses the oldest page as a result
 * The result will include the target as well
 */
schema.statics.findTargetAndAncestorsByPathOrId = async function(pathOrId: string): Promise<PageDocument[]> {
  let path;
  if (!hasSlash(pathOrId)) {
    const _id = pathOrId;
    const page = await this.findOne({ _id });
    if (page == null) throw Error('Page not found.');

    path = page.path;
  }
  else {
    path = pathOrId;
  }

  const ancestorPaths = collectAncestorPaths(path);
  ancestorPaths.push(path); // include target

  // Do not populate
  const queryBuilder = new PageQueryBuilder(this.find());
  const _ancestors: PageDocument[] = await queryBuilder
    .addConditionToListByPathsArray(ancestorPaths)
    .addConditionToSortAncestorPages()
    .query
    .lean()
    .exec();

  // no same path pages
  const ancestorsMap = new Map<string, PageDocument>();
  _ancestors.forEach(page => ancestorsMap.set(page.path, page));
  const ancestors = Array.from(ancestorsMap.values());

  return ancestors;
};

/*
 * Find all children by parent's path or id. Using id should be prioritized
 */
schema.statics.findChildrenByParentPathOrIdAndViewer = async function(parentPathOrId: string, user, userGroups = null): Promise<PageDocument[]> {
  let queryBuilder: PageQueryBuilder;
  if (hasSlash(parentPathOrId)) {
    const path = parentPathOrId;
    const regexp = generateChildrenRegExp(path);
    queryBuilder = new PageQueryBuilder(this.find({ path: { $regex: regexp.source } }));
  }
  else {
    const parentId = parentPathOrId;
    queryBuilder = new PageQueryBuilder(this.find({ parent: parentId }));
  }
  await addViewerCondition(queryBuilder, user, userGroups);

  return queryBuilder.query.lean().exec();
};

schema.statics.findAncestorsChildrenByPathAndViewer = async function(path: string, user, userGroups = null): Promise<Record<string, PageDocument[]>> {
  const ancestorPaths = collectAncestorPaths(path);
  const regexps = ancestorPaths.map(path => new RegExp(generateChildrenRegExp(path).source)); // cannot use re2

  // get pages at once
  const queryBuilder = new PageQueryBuilder(this.find({ path: { $in: regexps } }));
  await addViewerCondition(queryBuilder, user, userGroups);
  const _pages = await queryBuilder.query.lean().exec();
  const pages = _pages.map((page: PageDocument & {isTarget?: boolean}) => {
    if (page.path === path) {
      page.isTarget = true;
    }
    return page;
  });

  // make map
  const pathToChildren: Record<string, PageDocument[]> = {};
  ancestorPaths.forEach((path) => {
    pathToChildren[path] = pages.filter(page => page.path === path);
  });

  return pathToChildren;
};


/*
 * Merge obsolete page model methods and define new methods which depend on crowi instance
 */
export default (crowi: Crowi): any => {
  // add old page schema methods
  const pageSchema = getPageSchema(crowi);
  schema.methods = { ...pageSchema.methods, ...schema.methods };
  schema.statics = { ...pageSchema.statics, ...schema.statics };

  return getOrCreateModel<PageDocument, PageModel>('Page', schema);
};
