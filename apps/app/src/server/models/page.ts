/* eslint-disable @typescript-eslint/no-explicit-any */

import nodePath from 'path';

import { HasObjectId, pagePathUtils, pathUtils } from '@growi/core';
import { collectAncestorPaths } from '@growi/core/dist/utils/page-path-utils/collect-ancestor-paths';
import escapeStringRegexp from 'escape-string-regexp';
import mongoose, {
  Schema, Model, Document, AnyObject,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import { IPage, IPageHasId, PageGrant } from '~/interfaces/page';
import { IUserHasId } from '~/interfaces/user';
import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

import loggerFactory from '../../utils/logger';
import { getOrCreateModel } from '../util/mongoose-utils';

import { getPageSchema, extractToAncestorsPaths, populateDataToShowRevision } from './obsolete-page';

const { addTrailingSlash, normalizePath } = pathUtils;
const {
  isTopPage, hasSlash,
} = pagePathUtils;

const logger = loggerFactory('growi:models:page');
/*
 * define schema
 */
const GRANT_PUBLIC = 1;
const GRANT_RESTRICTED = 2;
const GRANT_SPECIFIED = 3; // DEPRECATED
const GRANT_OWNER = 4;
const GRANT_USER_GROUP = 5;
const PAGE_GRANT_ERROR = 1;
const STATUS_PUBLISHED = 'published';
const STATUS_DELETED = 'deleted';

export interface PageDocument extends IPage, Document {
  [x:string]: any // for obsolete methods
}


type TargetAndAncestorsResult = {
  targetAndAncestors: PageDocument[]
  rootPage: PageDocument
}

type PaginatedPages = {
  pages: PageDocument[],
  totalCount: number,
  limit: number,
  offset: number
}

export type CreateMethod = (path: string, body: string, user, options: PageCreateOptions) => Promise<PageDocument & { _id: any }>
export interface PageModel extends Model<PageDocument> {
  [x: string]: any; // for obsolete static methods
  findByIdsAndViewer(pageIds: ObjectIdLike[], user, userGroups?, includeEmpty?: boolean, includeAnyoneWithTheLink?: boolean): Promise<PageDocument[]>
  findByPathAndViewer(path: string | null, user, userGroups?, useFindOne?: true, includeEmpty?: boolean): Promise<PageDocument & HasObjectId | null>
  findByPathAndViewer(path: string | null, user, userGroups?, useFindOne?: false, includeEmpty?: boolean): Promise<(PageDocument & HasObjectId)[]>
  countByPathAndViewer(path: string | null, user, userGroups?, includeEmpty?:boolean): Promise<number>
  findTargetAndAncestorsByPathOrId(pathOrId: string): Promise<TargetAndAncestorsResult>
  findRecentUpdatedPages(path: string, user, option, includeEmpty?: boolean): Promise<PaginatedPages>
  generateGrantCondition(
    user, userGroups, includeAnyoneWithTheLink?: boolean, showPagesRestrictedByOwner?: boolean, showPagesRestrictedByGroup?: boolean,
  ): { $or: any[] }

  PageQueryBuilder: typeof PageQueryBuilder

  GRANT_PUBLIC
  GRANT_RESTRICTED
  GRANT_SPECIFIED
  GRANT_OWNER
  GRANT_USER_GROUP
  PAGE_GRANT_ERROR
  STATUS_PUBLISHED
  STATUS_DELETED
}

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new Schema<PageDocument, PageModel>({
  parent: {
    type: ObjectId, ref: 'Page', index: true, default: null,
  },
  descendantCount: { type: Number, default: 0 },
  isEmpty: { type: Boolean, default: false },
  path: {
    type: String, required: true, index: true,
  },
  revision: { type: ObjectId, ref: 'Revision' },
  latestRevisionBodyLength: { type: Number },
  status: { type: String, default: STATUS_PUBLISHED, index: true },
  grant: { type: Number, default: GRANT_PUBLIC, index: true },
  grantedUsers: [{ type: ObjectId, ref: 'User' }],
  grantedGroup: { type: ObjectId, ref: 'UserGroup', index: true },
  grantedExternalGroup: { type: ObjectId, ref: 'ExternalUserGroup', index: true },
  creator: { type: ObjectId, ref: 'User', index: true },
  lastUpdateUser: { type: ObjectId, ref: 'User' },
  liker: [{ type: ObjectId, ref: 'User' }],
  seenUsers: [{ type: ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
  pageIdOnHackmd: { type: String },
  revisionHackmdSynced: { type: ObjectId, ref: 'Revision' }, // the revision that is synced to HackMD
  hasDraftOnHackmd: { type: Boolean }, // set true if revision and revisionHackmdSynced are same but HackMD document has modified
  expandContentWidth: { type: Boolean },
  updatedAt: { type: Date, default: Date.now }, // Do not use timetamps for updatedAt because it breaks 'updateMetadata: false' option
  deleteUser: { type: ObjectId, ref: 'User' },
  deletedAt: { type: Date },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { getters: true },
  toObject: { getters: true },
});
// apply plugins
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);


export class PageQueryBuilder {

  query: any;

  constructor(query, includeEmpty = false) {
    this.query = query;
    if (!includeEmpty) {
      this.query = this.query
        .and({
          $or: [
            { isEmpty: false },
            { isEmpty: null }, // for v4 compatibility
          ],
        });
    }
  }

  /**
   * Used for filtering the pages at specified paths not to include unintentional pages.
   * @param pathsToFilter The paths to have additional filters as to be applicable
   * @returns PageQueryBuilder
   */
  addConditionToFilterByApplicableAncestors(pathsToFilter: string[]): PageQueryBuilder {
    this.query = this.query
      .and(
        {
          $or: [
            { path: '/' },
            { path: { $in: pathsToFilter }, grant: GRANT_PUBLIC, status: STATUS_PUBLISHED },
            { path: { $in: pathsToFilter }, parent: { $ne: null }, status: STATUS_PUBLISHED },
            { path: { $nin: pathsToFilter }, status: STATUS_PUBLISHED },
          ],
        },
      );

    return this;
  }

  addConditionToExcludeTrashed(): PageQueryBuilder {
    this.query = this.query
      .and({
        $or: [
          { status: null },
          { status: STATUS_PUBLISHED },
        ],
      });

    return this;
  }

  /**
   * generate the query to find the pages '{path}/*' and '{path}' self.
   * If top page, return without doing anything.
   */
  addConditionToListWithDescendants(path: string, option?): PageQueryBuilder {
    // No request is set for the top page
    if (isTopPage(path)) {
      return this;
    }

    const pathNormalized = pathUtils.normalizePath(path);
    const pathWithTrailingSlash = addTrailingSlash(path);

    const startsPattern = escapeStringRegexp(pathWithTrailingSlash);

    this.query = this.query
      .and({
        $or: [
          { path: pathNormalized },
          { path: new RegExp(`^${startsPattern}`) },
        ],
      });

    return this;
  }

  /**
   * generate the query to find the pages '{path}/*' (exclude '{path}' self).
   */
  addConditionToListOnlyDescendants(path: string, option): PageQueryBuilder {
    // exclude the target page
    this.query = this.query.and({ path: { $ne: path } });

    if (isTopPage(path)) {
      return this;
    }

    const pathWithTrailingSlash = addTrailingSlash(path);

    const startsPattern = escapeStringRegexp(pathWithTrailingSlash);

    this.query = this.query
      .and(
        { path: new RegExp(`^${startsPattern}`) },
      );

    return this;

  }

  addConditionToListOnlyAncestors(path: string): PageQueryBuilder {
    const pathNormalized = pathUtils.normalizePath(path);
    const ancestorsPaths = extractToAncestorsPaths(pathNormalized);

    this.query = this.query
      // exclude the target page
      .and({ path: { $ne: path } })
      .and(
        { path: { $in: ancestorsPaths } },
      );

    return this;

  }

  /**
   * generate the query to find pages that start with `path`
   *
   * In normal case, returns '{path}/*' and '{path}' self.
   * If top page, return without doing anything.
   *
   * *option*
   *   Left for backward compatibility
   */
  addConditionToListByStartWith(str: string): PageQueryBuilder {
    const path = normalizePath(str);

    // No request is set for the top page
    if (isTopPage(path)) {
      return this;
    }

    const startsPattern = escapeStringRegexp(path);

    this.query = this.query
      .and({ path: new RegExp(`^${startsPattern}`) });

    return this;
  }

  addConditionToListByNotStartWith(str: string): PageQueryBuilder {
    const path = normalizePath(str);

    // No request is set for the top page
    if (isTopPage(path)) {
      return this;
    }

    const startsPattern = escapeStringRegexp(str);

    this.query = this.query
      .and({ path: new RegExp(`^(?!${startsPattern}).*$`) });

    return this;
  }

  addConditionToListByMatch(str: string): PageQueryBuilder {
    // No request is set for "/"
    if (str === '/') {
      return this;
    }

    const match = escapeStringRegexp(str);

    this.query = this.query
      .and({ path: new RegExp(`^(?=.*${match}).*$`) });

    return this;
  }

  addConditionToListByNotMatch(str: string): PageQueryBuilder {
    // No request is set for "/"
    if (str === '/') {
      return this;
    }

    const match = escapeStringRegexp(str);

    this.query = this.query
      .and({ path: new RegExp(`^(?!.*${match}).*$`) });

    return this;
  }

  async addConditionForParentNormalization(user): Promise<PageQueryBuilder> {
    // determine UserGroup condition
    let userGroups;
    if (user != null) {
      const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model
      userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
    }

    const grantConditions: any[] = [
      { grant: null },
      { grant: GRANT_PUBLIC },
    ];

    if (user != null) {
      grantConditions.push(
        { grant: GRANT_OWNER, grantedUsers: user._id },
      );
    }

    if (userGroups != null && userGroups.length > 0) {
      grantConditions.push(
        { grant: GRANT_USER_GROUP, grantedGroup: { $in: userGroups } },
      );
    }

    this.query = this.query
      .and({
        $or: grantConditions,
      });

    return this;
  }

  async addConditionAsMigratablePages(user): Promise<PageQueryBuilder> {
    this.query = this.query
      .and({
        $or: [
          { grant: { $ne: GRANT_RESTRICTED } },
          { grant: { $ne: GRANT_SPECIFIED } },
        ],
      });
    this.addConditionAsRootOrNotOnTree();
    this.addConditionAsNonRootPage();
    this.addConditionToExcludeTrashed();
    await this.addConditionForParentNormalization(user);

    return this;
  }

  // add viewer condition to PageQueryBuilder instance
  async addViewerCondition(user, userGroups = null, includeAnyoneWithTheLink = false): Promise<PageQueryBuilder> {
    let relatedUserGroups = userGroups;
    if (user != null && relatedUserGroups == null) {
      const UserGroupRelation: any = mongoose.model('UserGroupRelation');
      relatedUserGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
    }

    this.addConditionToFilteringByViewer(user, relatedUserGroups, includeAnyoneWithTheLink);
    return this;
  }

  addConditionToFilteringByViewer(
      user, userGroups, includeAnyoneWithTheLink = false, showPagesRestrictedByOwner = false, showPagesRestrictedByGroup = false,
  ): PageQueryBuilder {
    const condition = generateGrantCondition(user, userGroups, includeAnyoneWithTheLink, showPagesRestrictedByOwner, showPagesRestrictedByGroup);

    this.query = this.query
      .and(condition);

    return this;
  }

  addConditionToPagenate(offset, limit, sortOpt?): PageQueryBuilder {
    this.query = this.query
      .sort(sortOpt).skip(offset).limit(limit); // eslint-disable-line newline-per-chained-call

    return this;
  }

  addConditionAsNonRootPage(): PageQueryBuilder {
    this.query = this.query.and({ path: { $ne: '/' } });

    return this;
  }

  addConditionAsRootOrNotOnTree(): PageQueryBuilder {
    this.query = this.query
      .and({ parent: null });

    return this;
  }

  addConditionAsOnTree(): PageQueryBuilder {
    this.query = this.query
      .and(
        {
          $or: [
            { parent: { $ne: null } },
            { path: '/' },
          ],
        },
      );

    return this;
  }

  /*
   * Add this condition when get any ancestor pages including the target's parent
   */
  addConditionToSortPagesByDescPath(): PageQueryBuilder {
    this.query = this.query.sort('-path');

    return this;
  }

  addConditionToSortPagesByAscPath(): PageQueryBuilder {
    this.query = this.query.sort('path');

    return this;
  }

  addConditionToMinimizeDataForRendering(): PageQueryBuilder {
    this.query = this.query.select('_id path isEmpty grant revision descendantCount');

    return this;
  }

  addConditionToListByPathsArray(paths): PageQueryBuilder {
    this.query = this.query
      .and({
        path: {
          $in: paths,
        },
      });

    return this;
  }

  addConditionToListByPageIdsArray(pageIds): PageQueryBuilder {
    this.query = this.query
      .and({
        _id: {
          $in: pageIds,
        },
      });

    return this;
  }

  addConditionToExcludeByPageIdsArray(pageIds): PageQueryBuilder {
    this.query = this.query
      .and({
        _id: {
          $nin: pageIds,
        },
      });

    return this;
  }

  populateDataToList(userPublicFields): PageQueryBuilder {
    this.query = this.query
      .populate({
        path: 'lastUpdateUser',
        select: userPublicFields,
      });
    return this;
  }

  populateDataToShowRevision(userPublicFields): PageQueryBuilder {
    this.query = populateDataToShowRevision(this.query, userPublicFields);
    return this;
  }

  addConditionToFilteringByParentId(parentId): PageQueryBuilder {
    this.query = this.query.and({ parent: parentId });
    return this;
  }

}

schema.statics.createEmptyPage = async function(
    path: string, parent: any, descendantCount = 0, // TODO: improve type including IPage at https://redmine.weseek.co.jp/issues/86506
): Promise<PageDocument & { _id: any }> {
  if (parent == null) {
    throw Error('parent must not be null');
  }

  const Page = this;
  const page = new Page();
  page.path = path;
  page.isEmpty = true;
  page.parent = parent;
  page.descendantCount = descendantCount;

  return page.save();
};

/**
 * Replace an existing page with an empty page.
 * It updates the children's parent to the new empty page's _id.
 * @param exPage a page document to be replaced
 * @returns Promise<void>
 */
schema.statics.replaceTargetWithPage = async function(exPage, pageToReplaceWith?, deleteExPageIfEmpty = false) {
  // find parent
  const parent = await this.findOne({ _id: exPage.parent });
  if (parent == null) {
    throw Error('parent to update does not exist. Prepare parent first.');
  }

  // create empty page at path
  const newTarget = pageToReplaceWith == null ? await this.createEmptyPage(exPage.path, parent, exPage.descendantCount) : pageToReplaceWith;

  // find children by ex-page _id
  const children = await this.find({ parent: exPage._id });

  // bulkWrite
  const operationForNewTarget = {
    updateOne: {
      filter: { _id: newTarget._id },
      update: {
        parent: parent._id,
      },
    },
  };
  const operationsForChildren = {
    updateMany: {
      filter: {
        _id: { $in: children.map(d => d._id) },
      },
      update: {
        parent: newTarget._id,
      },
    },
  };

  await this.bulkWrite([operationForNewTarget, operationsForChildren]);

  const isExPageEmpty = exPage.isEmpty;
  if (deleteExPageIfEmpty && isExPageEmpty) {
    await this.deleteOne({ _id: exPage._id });
    logger.warn('Deleted empty page since it was replaced with another page.');
  }

  return this.findById(newTarget._id);
};

/*
 * Find pages by ID and viewer.
 */
schema.statics.findByIdsAndViewer = async function(
    pageIds: string[], user, userGroups?, includeEmpty?: boolean, includeAnyoneWithTheLink?: boolean,
): Promise<PageDocument[]> {
  const baseQuery = this.find({ _id: { $in: pageIds } });
  const queryBuilder = new PageQueryBuilder(baseQuery, includeEmpty);

  await queryBuilder.addViewerCondition(user, userGroups, includeAnyoneWithTheLink);

  return queryBuilder.query.exec();
};

/*
 * Find a page by path and viewer. Pass true to useFindOne to use findOne method.
 */
schema.statics.findByPathAndViewer = async function(
    path: string | null, user, userGroups = null, useFindOne = false, includeEmpty = false,
): Promise<(PageDocument | PageDocument[]) & HasObjectId | null> {
  if (path == null) {
    throw new Error('path is required.');
  }

  const baseQuery = useFindOne ? this.findOne({ path }) : this.find({ path });
  const includeAnyoneWithTheLink = useFindOne;
  const queryBuilder = new PageQueryBuilder(baseQuery, includeEmpty);

  await queryBuilder.addViewerCondition(user, userGroups, includeAnyoneWithTheLink);

  return queryBuilder.query.exec();
};

schema.statics.countByPathAndViewer = async function(path: string | null, user, userGroups = null, includeEmpty = false): Promise<number> {
  if (path == null) {
    throw new Error('path is required.');
  }

  const baseQuery = this.count({ path });
  const queryBuilder = new PageQueryBuilder(baseQuery, includeEmpty);

  await queryBuilder.addViewerCondition(user, userGroups);

  return queryBuilder.query.exec();
};

schema.statics.findRecentUpdatedPages = async function(
    path: string, user, options, includeEmpty = false,
): Promise<PaginatedPages> {

  const sortOpt = {};
  sortOpt[options.sort] = options.desc;

  const Page = this;
  const User = mongoose.model('User') as any;

  if (path == null) {
    throw new Error('path is required.');
  }

  const baseQuery = this.find({});
  const queryBuilder = new PageQueryBuilder(baseQuery, includeEmpty);
  if (!options.includeTrashed) {
    queryBuilder.addConditionToExcludeTrashed();
  }

  queryBuilder.addConditionToListWithDescendants(path, options);
  queryBuilder.populateDataToList(User.USER_FIELDS_EXCEPT_CONFIDENTIAL);
  await queryBuilder.addViewerCondition(user);
  const pages = await Page.paginate(queryBuilder.query.clone(), {
    lean: true, sort: sortOpt, offset: options.offset, limit: options.limit,
  });
  const results = {
    pages: pages.docs, totalCount: pages.totalDocs, offset: options.offset, limit: options.limit,
  };

  return results;
};


/*
 * Find all ancestor pages by path. When duplicate pages found, it uses the oldest page as a result
 * The result will include the target as well
 */
schema.statics.findTargetAndAncestorsByPathOrId = async function(pathOrId: string, user, userGroups): Promise<TargetAndAncestorsResult> {
  let path;
  if (!hasSlash(pathOrId)) {
    const _id = pathOrId;
    const page = await this.findOne({ _id });

    path = page == null ? '/' : page.path;
  }
  else {
    path = pathOrId;
  }

  const ancestorPaths = collectAncestorPaths(path);
  ancestorPaths.push(path); // include target

  // Do not populate
  const queryBuilder = new PageQueryBuilder(this.find(), true);
  await queryBuilder.addViewerCondition(user, userGroups);

  const _targetAndAncestors: PageDocument[] = await queryBuilder
    .addConditionAsOnTree()
    .addConditionToListByPathsArray(ancestorPaths)
    .addConditionToMinimizeDataForRendering()
    .addConditionToSortPagesByDescPath()
    .query
    .lean()
    .exec();

  // no same path pages
  const ancestorsMap = new Map<string, PageDocument>();
  _targetAndAncestors.forEach(page => ancestorsMap.set(page.path, page));
  const targetAndAncestors = Array.from(ancestorsMap.values());
  const rootPage = targetAndAncestors[targetAndAncestors.length - 1];

  return { targetAndAncestors, rootPage };
};

/**
 * Create empty pages at paths at which no pages exist
 * @param paths Page paths
 * @param aggrPipelineForExistingPages AggregationPipeline object to find existing pages at paths
 */
schema.statics.createEmptyPagesByPaths = async function(paths: string[], aggrPipelineForExistingPages: any[]): Promise<void> {
  const existingPages = await this.aggregate(aggrPipelineForExistingPages);

  const existingPagePaths = existingPages.map(page => page.path);
  const notExistingPagePaths = paths.filter(path => !existingPagePaths.includes(path));

  await this.insertMany(notExistingPagePaths.map(path => ({ path, isEmpty: true })));
};

/**
 * Find a parent page by path
 * @param {string} path
 * @returns {Promise<PageDocument | null>}
 */
schema.statics.findParentByPath = async function(path: string): Promise<PageDocument | null> {
  const parentPath = nodePath.dirname(path);

  const builder = new PageQueryBuilder(this.find({ path: parentPath }), true);
  const pagesCanBeParent = await builder
    .addConditionAsOnTree()
    .query
    .exec();

  if (pagesCanBeParent.length >= 1) {
    return pagesCanBeParent[0]; // the earliest page will be the result
  }

  return null;
};

/*
 * Utils from obsolete-page.js
 */
export async function pushRevision(pageData, newRevision, user) {
  await newRevision.save();

  pageData.revision = newRevision;
  pageData.latestRevisionBodyLength = newRevision.body.length;
  pageData.lastUpdateUser = user?._id ?? user;
  pageData.updatedAt = Date.now();

  return pageData.save();
}

/**
 * add/subtract descendantCount of pages with provided paths by increment.
 * increment can be negative number
 */
schema.statics.incrementDescendantCountOfPageIds = async function(pageIds: ObjectIdLike[], increment: number): Promise<void> {
  await this.updateMany({ _id: { $in: pageIds } }, { $inc: { descendantCount: increment } });
};

/**
 * recount descendantCount of a page with the provided id and return it
 */
schema.statics.recountDescendantCount = async function(id: ObjectIdLike): Promise<number> {
  const res = await this.aggregate(
    [
      {
        $match: {
          parent: id,
        },
      },
      {
        $project: {
          parent: 1,
          isEmpty: 1,
          descendantCount: 1,
        },
      },
      {
        $group: {
          _id: '$parent',
          sumOfDescendantCount: {
            $sum: '$descendantCount',
          },
          sumOfDocsCount: {
            $sum: {
              $cond: { if: { $eq: ['$isEmpty', true] }, then: 0, else: 1 }, // exclude isEmpty true page from sumOfDocsCount
            },
          },
        },
      },
      {
        $set: {
          descendantCount: {
            $sum: ['$sumOfDescendantCount', '$sumOfDocsCount'],
          },
        },
      },
    ],
  );

  return res.length === 0 ? 0 : res[0].descendantCount;
};

schema.statics.findAncestorsUsingParentRecursively = async function(pageId: ObjectIdLike, shouldIncludeTarget: boolean) {
  const self = this;
  const target = await this.findById(pageId);
  if (target == null) {
    throw Error('Target not found');
  }

  async function findAncestorsRecursively(target, ancestors = shouldIncludeTarget ? [target] : []) {
    const parent = await self.findOne({ _id: target.parent });
    if (parent == null) {
      return ancestors;
    }

    return findAncestorsRecursively(parent, [...ancestors, parent]);
  }

  return findAncestorsRecursively(target);
};

// TODO: write test code
/**
 * Recursively removes empty pages at leaf position.
 * @param pageId ObjectIdLike
 * @returns Promise<void>
 */
schema.statics.removeLeafEmptyPagesRecursively = async function(pageId: ObjectIdLike): Promise<void> {
  const self = this;

  const initialPage = await this.findById(pageId);

  if (initialPage == null) {
    return;
  }

  if (!initialPage.isEmpty) {
    return;
  }

  async function generatePageIdsToRemove(childPage, page, pageIds: ObjectIdLike[] = []): Promise<ObjectIdLike[]> {
    if (!page.isEmpty) {
      return pageIds;
    }

    const isChildrenOtherThanTargetExist = await self.exists({ _id: { $ne: childPage?._id }, parent: page._id });
    if (isChildrenOtherThanTargetExist) {
      return pageIds;
    }

    pageIds.push(page._id);

    const nextPage = await self.findById(page.parent);

    if (nextPage == null) {
      return pageIds;
    }

    return generatePageIdsToRemove(page, nextPage, pageIds);
  }

  const pageIdsToRemove = await generatePageIdsToRemove(null, initialPage);

  await this.deleteMany({ _id: { $in: pageIdsToRemove } });
};

schema.statics.normalizeDescendantCountById = async function(pageId) {
  const children = await this.find({ parent: pageId });

  const sumChildrenDescendantCount = children.map(d => d.descendantCount).reduce((c1, c2) => c1 + c2);
  const sumChildPages = children.filter(p => !p.isEmpty).length;

  return this.updateOne({ _id: pageId }, { $set: { descendantCount: sumChildrenDescendantCount + sumChildPages } }, { new: true });
};

schema.statics.takeOffFromTree = async function(pageId: ObjectIdLike) {
  return this.findByIdAndUpdate(pageId, { $set: { parent: null } });
};

schema.statics.removeEmptyPages = async function(pageIdsToNotRemove: ObjectIdLike[], paths: string[]): Promise<void> {
  await this.deleteMany({
    _id: {
      $nin: pageIdsToNotRemove,
    },
    path: {
      $in: paths,
    },
    isEmpty: true,
  });
};

/**
 * Find a not empty parent recursively.
 * @param {string} path
 * @returns {Promise<PageDocument | null>}
 */
schema.statics.findNotEmptyParentByPathRecursively = async function(path: string): Promise<PageDocument | null> {
  const parent = await this.findParentByPath(path);
  if (parent == null) {
    return null;
  }

  const recursive = async(page: PageDocument): Promise<PageDocument> => {
    if (!page.isEmpty) {
      return page;
    }

    const next = await this.findById(page.parent);

    if (next == null || isTopPage(next.path)) {
      return page;
    }

    return recursive(next);
  };

  const notEmptyParent = await recursive(parent);

  return notEmptyParent;
};

schema.statics.findParent = async function(pageId): Promise<PageDocument | null> {
  return this.findOne({ _id: pageId });
};

schema.statics.PageQueryBuilder = PageQueryBuilder as any; // mongoose does not support constructor type as statics attrs type

export function generateGrantCondition(
    user, userGroups, includeAnyoneWithTheLink = false, showPagesRestrictedByOwner = false, showPagesRestrictedByGroup = false,
): { $or: any[] } {
  const grantConditions: AnyObject[] = [
    { grant: null },
    { grant: GRANT_PUBLIC },
  ];

  if (includeAnyoneWithTheLink) {
    grantConditions.push({ grant: GRANT_RESTRICTED });
  }

  if (showPagesRestrictedByOwner) {
    grantConditions.push(
      { grant: GRANT_SPECIFIED },
      { grant: GRANT_OWNER },
    );
  }
  else if (user != null) {
    grantConditions.push(
      { grant: GRANT_SPECIFIED, grantedUsers: user._id },
      { grant: GRANT_OWNER, grantedUsers: user._id },
    );
  }

  if (showPagesRestrictedByGroup) {
    grantConditions.push(
      { grant: GRANT_USER_GROUP },
    );
  }
  else if (userGroups != null && userGroups.length > 0) {
    grantConditions.push(
      { grant: GRANT_USER_GROUP, grantedGroup: { $in: userGroups } },
    );
  }

  return {
    $or: grantConditions,
  };
}

schema.statics.generateGrantCondition = generateGrantCondition;

// find ancestor page with isEmpty: false. If parameter path is '/', return undefined
schema.statics.findNonEmptyClosestAncestor = async function(path: string): Promise<PageDocument | undefined> {
  if (path === '/') {
    return;
  }

  const builderForAncestors = new PageQueryBuilder(this.find(), false); // empty page not included

  const ancestors = await builderForAncestors
    .addConditionToListOnlyAncestors(path) // only ancestor paths
    .addConditionToSortPagesByDescPath() // sort by path in Desc. Long to Short.
    .query
    .exec();

  return ancestors[0];
};


export type PageCreateOptions = {
  format?: string
  grantUserGroupId?: ObjectIdLike
  grant?: number
  overwriteScopesOfDescendants?: boolean
}

/*
 * Merge obsolete page model methods and define new methods which depend on crowi instance
 */
export default function PageModel(crowi): any {
  // add old page schema methods
  const pageSchema = getPageSchema(crowi);
  schema.methods = { ...pageSchema.methods, ...schema.methods };
  schema.statics = { ...pageSchema.statics, ...schema.statics };

  return getOrCreateModel<PageDocument, PageModel>('Page', schema as any); // TODO: improve type
}
