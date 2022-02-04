/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, {
  Schema, Model, Document, AnyObject,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';
import nodePath from 'path';
import { getOrCreateModel, pagePathUtils } from '@growi/core';

import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';
import { IPage } from '../../interfaces/page';
import { getPageSchema, PageQueryBuilder } from './obsolete-page';
import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import { PageRedirectModel } from './page-redirect';

const { isTopPage, collectAncestorPaths } = pagePathUtils;

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

export interface PageDocument extends IPage, Document {}


type TargetAndAncestorsResult = {
  targetAndAncestors: PageDocument[]
  rootPage: PageDocument
}

export type CreateMethod = (path: string, body: string, user, options) => Promise<PageDocument & { _id: any }>
export interface PageModel extends Model<PageDocument> {
  [x: string]: any; // for obsolete methods
  createEmptyPagesByPaths(paths: string[], publicOnly?: boolean): Promise<void>
  getParentAndFillAncestors(path: string): Promise<PageDocument & { _id: any }>
  findByIdsAndViewer(pageIds: string[], user, userGroups?, includeEmpty?: boolean): Promise<PageDocument[]>
  findByPathAndViewer(path: string | null, user, userGroups?, useFindOne?: boolean, includeEmpty?: boolean): Promise<PageDocument[]>
  findTargetAndAncestorsByPathOrId(pathOrId: string): Promise<TargetAndAncestorsResult>
  findChildrenByParentPathOrIdAndViewer(parentPathOrId: string, user, userGroups?): Promise<PageDocument[]>
  findAncestorsChildrenByPathAndViewer(path: string, user, userGroups?): Promise<Record<string, PageDocument[]>>

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
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
  deleteUser: { type: ObjectId, ref: 'User' },
  deletedAt: { type: Date },
}, {
  toJSON: { getters: true },
  toObject: { getters: true },
});
// apply plugins
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

const hasSlash = (str: string): boolean => {
  return str.includes('/');
};

/*
 * Generate RegExp instance for one level lower path
 */
const generateChildrenRegExp = (path: string): RegExp => {
  // https://regex101.com/r/laJGzj/1
  // ex. /any_level1
  if (isTopPage(path)) return new RegExp(/^\/[^/]+$/);

  // https://regex101.com/r/mrDJrx/1
  // ex. /parent/any_child OR /any_level1
  return new RegExp(`^${path}(\\/[^/]+)\\/?$`);
};

/*
 * Create empty pages if the page in paths didn't exist
 */
schema.statics.createEmptyPagesByPaths = async function(paths: string[], publicOnly = false): Promise<void> {
  // find existing parents
  const builder = new PageQueryBuilder(this.find(publicOnly ? { grant: GRANT_PUBLIC } : {}, { _id: 0, path: 1 }), true);
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

schema.statics.createEmptyPage = async function(
    path: string, parent: any, // TODO: improve type including IPage at https://redmine.weseek.co.jp/issues/86506
): Promise<PageDocument & { _id: any }> {
  if (parent == null) {
    throw Error('parent must not be null');
  }

  const Page = this;
  const page = new Page();
  page.path = path;
  page.isEmpty = true;
  page.parent = parent;

  return page.save();
};

/**
 * Replace an existing page with an empty page.
 * It updates the children's parent to the new empty page's _id.
 * @param exPage a page document to be replaced
 * @returns Promise<void>
 */
schema.statics.replaceTargetWithPage = async function(exPage, pageToReplaceWith?): Promise<void> {
  // find parent
  const parent = await this.findOne({ _id: exPage.parent });
  if (parent == null) {
    throw Error('parent to update does not exist. Prepare parent first.');
  }

  // create empty page at path
  const newTarget = pageToReplaceWith == null ? await this.createEmptyPage(exPage.path, parent) : pageToReplaceWith;

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
};

/**
 * Find parent or create parent if not exists.
 * It also updates parent of ancestors
 * @param path string
 * @returns Promise<PageDocument>
 */
schema.statics.getParentAndFillAncestors = async function(path: string): Promise<PageDocument> {
  const parentPath = nodePath.dirname(path);
  const parent = await this.findOne({ path: parentPath }); // find the oldest parent which must always be the true parent
  if (parent != null) {
    return parent;
  }

  /*
   * Fill parents if parent is null
   */
  const ancestorPaths = collectAncestorPaths(path); // paths of parents need to be created

  // just create ancestors with empty pages
  await this.createEmptyPagesByPaths(ancestorPaths);

  // find ancestors
  const builder = new PageQueryBuilder(this.find(), true);
  const ancestors = await builder
    .addConditionToListByPathsArray(ancestorPaths)
    .addConditionToSortPagesByDescPath()
    .query
    .exec();

  const ancestorsMap = new Map(); // Map<path, page>
  ancestors.forEach(page => !ancestorsMap.has(page.path) && ancestorsMap.set(page.path, page)); // the earlier element should be the true ancestor

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

  const createdParent = ancestorsMap.get(parentPath);

  return createdParent;
};

// Utility function to add viewer condition to PageQueryBuilder instance
const addViewerCondition = async(queryBuilder: PageQueryBuilder, user, userGroups = null): Promise<void> => {
  let relatedUserGroups = userGroups;
  if (user != null && relatedUserGroups == null) {
    const UserGroupRelation: any = mongoose.model('UserGroupRelation');
    relatedUserGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
  }

  queryBuilder.addConditionToFilteringByViewer(user, relatedUserGroups, false);
};

/*
 * Find pages by ID and viewer.
 */
schema.statics.findByIdsAndViewer = async function(pageIds: string[], user, userGroups?, includeEmpty?: boolean): Promise<PageDocument[]> {
  const baseQuery = this.find({ _id: { $in: pageIds } });
  const queryBuilder = new PageQueryBuilder(baseQuery, includeEmpty);

  await addViewerCondition(queryBuilder, user, userGroups);

  return queryBuilder.query.exec();
};

/*
 * Find a page by path and viewer. Pass false to useFindOne to use findOne method.
 */
schema.statics.findByPathAndViewer = async function(
    path: string | null, user, userGroups = null, useFindOne = true, includeEmpty = false,
): Promise<PageDocument | PageDocument[] | null> {
  if (path == null) {
    throw new Error('path is required.');
  }

  const baseQuery = useFindOne ? this.findOne({ path }) : this.find({ path });
  const queryBuilder = new PageQueryBuilder(baseQuery, includeEmpty);

  await addViewerCondition(queryBuilder, user, userGroups);

  return queryBuilder.query.exec();
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
    if (page == null) throw new Error('Page not found.');

    path = page.path;
  }
  else {
    path = pathOrId;
  }

  const ancestorPaths = collectAncestorPaths(path);
  ancestorPaths.push(path); // include target

  // Do not populate
  const queryBuilder = new PageQueryBuilder(this.find(), true);
  await addViewerCondition(queryBuilder, user, userGroups);

  const _targetAndAncestors: PageDocument[] = await queryBuilder
    .addConditionAsMigrated()
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

/*
 * Find all children by parent's path or id. Using id should be prioritized
 */
schema.statics.findChildrenByParentPathOrIdAndViewer = async function(parentPathOrId: string, user, userGroups = null): Promise<PageDocument[]> {
  let queryBuilder: PageQueryBuilder;
  if (hasSlash(parentPathOrId)) {
    const path = parentPathOrId;
    const regexp = generateChildrenRegExp(path);
    queryBuilder = new PageQueryBuilder(this.find({ path: { $regex: regexp } }), true);
  }
  else {
    const parentId = parentPathOrId;
    queryBuilder = new PageQueryBuilder(this.find({ parent: parentId } as any), true); // TODO: improve type
  }
  await addViewerCondition(queryBuilder, user, userGroups);

  return queryBuilder
    .addConditionToSortPagesByAscPath()
    .query
    .lean()
    .exec();
};

schema.statics.findAncestorsChildrenByPathAndViewer = async function(path: string, user, userGroups = null): Promise<Record<string, PageDocument[]>> {
  const ancestorPaths = isTopPage(path) ? ['/'] : collectAncestorPaths(path); // root path is necessary for rendering
  const regexps = ancestorPaths.map(path => new RegExp(generateChildrenRegExp(path))); // cannot use re2

  // get pages at once
  const queryBuilder = new PageQueryBuilder(this.find({ path: { $in: regexps } }), true);
  await addViewerCondition(queryBuilder, user, userGroups);
  const _pages = await queryBuilder
    .addConditionAsMigrated()
    .addConditionToMinimizeDataForRendering()
    .addConditionToSortPagesByAscPath()
    .query
    .lean()
    .exec();
  // mark target
  const pages = _pages.map((page: PageDocument & {isTarget?: boolean}) => {
    if (page.path === path) {
      page.isTarget = true;
    }
    return page;
  });

  /*
   * If any non-migrated page is found during creating the pathToChildren map, it will stop incrementing at that moment
   */
  const pathToChildren: Record<string, PageDocument[]> = {};
  const sortedPaths = ancestorPaths.sort((a, b) => a.length - b.length); // sort paths by path.length
  sortedPaths.every((path) => {
    const children = pages.filter(page => nodePath.dirname(page.path) === path);
    if (children.length === 0) {
      return false; // break when children do not exist
    }
    pathToChildren[path] = children;
    return true;
  });

  return pathToChildren;
};

/*
 * Utils from obsolete-page.js
 */
async function pushRevision(pageData, newRevision, user) {
  await newRevision.save();

  pageData.revision = newRevision;
  pageData.lastUpdateUser = user;
  pageData.updatedAt = Date.now();

  return pageData.save();
}

/**
 * return aggregate condition to get following pages
 * - page that has the same path as the provided path
 * - pages that are descendants of the above page
 * pages without parent will be ignored
 */
schema.statics.getAggrConditionForPageWithProvidedPathAndDescendants = function(path:string) {
  let match;
  if (isTopPage(path)) {
    match = {
      // https://regex101.com/r/Kip2rV/1
      $match: { $or: [{ path: { $regex: '^/.*' }, parent: { $ne: null } }, { path: '/' }] },
    };
  }
  else {
    match = {
      // https://regex101.com/r/mJvGrG/1
      $match: { path: { $regex: `^${path}(/.*|$)` }, parent: { $ne: null } },
    };
  }
  return [
    match,
    {
      $project: {
        path: 1,
        parent: 1,
        field_length: { $strLenCP: '$path' },
      },
    },
    { $sort: { field_length: -1 } },
    { $project: { field_length: 0 } },
  ];
};

/**
 * add/subtract descendantCount of pages with provided paths by increment.
 * increment can be negative number
 */
schema.statics.incrementDescendantCountOfPaths = async function(paths:string[], increment: number):Promise<void> {
  const pages = await this.aggregate([{ $match: { path: { $in: paths } } }]);
  const operations = pages.map((page) => {
    return {
      updateOne: {
        filter: { path: page.path },
        update: { descendantCount: page.descendantCount + increment },
      },
    };
  });
  await this.bulkWrite(operations);
};

// update descendantCount of a page with provided id
schema.statics.recountDescendantCountOfSelfAndDescendants = async function(id:mongoose.Types.ObjectId):Promise<void> {
  const res = await this.aggregate(
    [
      {
        $match: {
          parent: id,
        },
      },
      {
        $project: {
          path: 1,
          parent: 1,
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
            $sum: 1,
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

  const query = { descendantCount: res.length === 0 ? 0 : res[0].descendantCount };
  await this.findByIdAndUpdate(id, query);
};

export type PageCreateOptions = {
  format?: string
  grantUserGroupId?: ObjectIdLike
  grant?: number
}

/*
 * Merge obsolete page model methods and define new methods which depend on crowi instance
 */
export default (crowi: Crowi): any => {
  let pageEvent;
  if (crowi != null) {
    pageEvent = crowi.event('page');
  }

  schema.statics.create = async function(path: string, body: string, user, options: PageCreateOptions = {}) {
    if (crowi.pageGrantService == null || crowi.configManager == null) {
      throw Error('Crowi is not setup');
    }

    const isV5Compatible = crowi.configManager.getConfig('crowi', 'app:isV5Compatible');
    // v4 compatible process
    if (!isV5Compatible) {
      return this.createV4(path, body, user, options);
    }

    const Page = this;
    const Revision = crowi.model('Revision');
    const {
      format = 'markdown', grantUserGroupId,
    } = options;
    let grant = options.grant;

    // sanitize path
    path = crowi.xss.process(path); // eslint-disable-line no-param-reassign
    // throw if exists
    const isExist = (await this.count({ path, isEmpty: false })) > 0; // not validate empty page
    if (isExist) {
      throw new Error('Cannot create new page to existed path');
    }
    // force public
    if (isTopPage(path)) {
      grant = GRANT_PUBLIC;
    }

    // find an existing empty page
    const emptyPage = await Page.findOne({ path, isEmpty: true });

    /*
     * UserGroup & Owner validation
     */
    if (grant !== GRANT_RESTRICTED) {
      let isGrantNormalized = false;
      try {
        // It must check descendants as well if emptyTarget is not null
        const shouldCheckDescendants = emptyPage != null;
        const newGrantedUserIds = grant === GRANT_OWNER ? [user._id] as IObjectId[] : undefined;

        isGrantNormalized = await crowi.pageGrantService.isGrantNormalized(path, grant, newGrantedUserIds, grantUserGroupId, shouldCheckDescendants);
      }
      catch (err) {
        logger.error(`Failed to validate grant of page at "${path}" of grant ${grant}:`, err);
        throw err;
      }
      if (!isGrantNormalized) {
        throw Error('The selected grant or grantedGroup is not assignable to this page.');
      }
    }

    /*
     * update empty page if exists, if not, create a new page
     */
    let page;
    if (emptyPage != null) {
      page = emptyPage;
      page.isEmpty = false;
    }
    else {
      page = new Page();
    }

    let parentId: IObjectId | string | null = null;
    const parent = await Page.getParentAndFillAncestors(path);
    if (!isTopPage(path)) {
      parentId = parent._id;
    }

    page.path = path;
    page.creator = user;
    page.lastUpdateUser = user;
    page.status = STATUS_PUBLISHED;

    // set parent to null when GRANT_RESTRICTED
    if (grant === GRANT_RESTRICTED) {
      page.parent = null;
    }
    else {
      page.parent = parentId;
    }

    page.applyScope(user, grant, grantUserGroupId);

    let savedPage = await page.save();

    /*
     * After save
     */
    // Delete PageRedirect if exists
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;
    try {
      await PageRedirect.deleteOne({ from: path });
      logger.warn(`Deleted page redirect after creating a new page at path "${path}".`);
    }
    catch (err) {
      // no throw
      logger.error('Failed to delete PageRedirect');
    }

    const newRevision = Revision.prepareRevision(savedPage, body, null, user, { format });
    savedPage = await pushRevision(savedPage, newRevision, user);
    await savedPage.populateDataToShowRevision();

    pageEvent.emit('create', savedPage, user);

    return savedPage;
  };

  schema.statics.updatePage = async function(pageData, body, previousBody, user, options = {}) {
    if (crowi.configManager == null || crowi.pageGrantService == null) {
      throw Error('Crowi is not set up');
    }

    const isPageMigrated = pageData.parent != null;
    const isV5Compatible = crowi.configManager.getConfig('crowi', 'app:isV5Compatible');
    if (!isV5Compatible || !isPageMigrated) {
      // v4 compatible process
      return this.updatePageV4(pageData, body, previousBody, user, options);
    }

    const Revision = mongoose.model('Revision') as any; // TODO: Typescriptize model
    const grant = options.grant || pageData.grant; // use the previous data if absence
    const grantUserGroupId = options.grantUserGroupId || pageData.grantUserGroupId; // use the previous data if absence
    const isSyncRevisionToHackmd = options.isSyncRevisionToHackmd;
    const grantedUserIds = pageData.grantedUserIds || [user._id];

    const newPageData = pageData;

    if (grant === GRANT_RESTRICTED) {
      newPageData.parent = null;
    }
    else {
      /*
       * UserGroup & Owner validation
       */
      let isGrantNormalized = false;
      try {
        const shouldCheckDescendants = true;

        isGrantNormalized = await crowi.pageGrantService.isGrantNormalized(pageData.path, grant, grantedUserIds, grantUserGroupId, shouldCheckDescendants);
      }
      catch (err) {
        logger.error(`Failed to validate grant of page at "${pageData.path}" of grant ${grant}:`, err);
        throw err;
      }
      if (!isGrantNormalized) {
        throw Error('The selected grant or grantedGroup is not assignable to this page.');
      }
    }

    newPageData.applyScope(user, grant, grantUserGroupId);

    // update existing page
    let savedPage = await newPageData.save();
    const newRevision = await Revision.prepareRevision(newPageData, body, previousBody, user);
    savedPage = await pushRevision(savedPage, newRevision, user);
    await savedPage.populateDataToShowRevision();

    if (isSyncRevisionToHackmd) {
      savedPage = await this.syncRevisionToHackmd(savedPage);
    }

    pageEvent.emit('update', savedPage, user);

    return savedPage;
  };

  // add old page schema methods
  const pageSchema = getPageSchema(crowi);
  schema.methods = { ...pageSchema.methods, ...schema.methods };
  schema.statics = { ...pageSchema.statics, ...schema.statics };

  return getOrCreateModel<PageDocument, PageModel>('Page', schema as any); // TODO: improve type
};

/*
 * Aggregation utilities
 */
// TODO: use the original type when upgraded https://github.com/Automattic/mongoose/blob/master/index.d.ts#L3090
type PipelineStageMatch = {
  $match: AnyObject
};

export const generateGrantCondition = async(
    user, _userGroups, showAnyoneKnowsLink = false, showPagesRestrictedByOwner = false, showPagesRestrictedByGroup = false,
): Promise<PipelineStageMatch> => {
  let userGroups = _userGroups;
  if (user != null && userGroups == null) {
    const UserGroupRelation: any = mongoose.model('UserGroupRelation');
    userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
  }

  const grantConditions: AnyObject[] = [
    { grant: null },
    { grant: GRANT_PUBLIC },
  ];

  if (showAnyoneKnowsLink) {
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
    $match: {
      $or: grantConditions,
    },
  };
};
