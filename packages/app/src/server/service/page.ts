import pathlib from 'path';
import { Writable } from 'stream';

import { pagePathUtils, pathUtils } from '@growi/core';
import escapeStringRegexp from 'escape-string-regexp';
import mongoose, { ObjectId, QueryCursor } from 'mongoose';
import streamToPromise from 'stream-to-promise';

import { Ref } from '~/interfaces/common';
import { V5ConversionErrCode } from '~/interfaces/errors/v5-conversion-error';
import { HasObjectId } from '~/interfaces/has-object-id';
import {
  IPage, IPageInfo, IPageInfoAll, IPageInfoForEntity, IPageWithMeta,
} from '~/interfaces/page';
import {
  PageDeleteConfigValue, IPageDeleteConfigValueToProcessValidation,
} from '~/interfaces/page-delete-config';
import {
  IPageOperationProcessInfo, IPageOperationProcessData, PageActionStage, PageActionType,
} from '~/interfaces/page-operation';
import { IUserHasId } from '~/interfaces/user';
import { PageMigrationErrorData, SocketEventName, UpdateDescCountRawData } from '~/interfaces/websocket';
import {
  CreateMethod, PageCreateOptions, PageModel, PageDocument, pushRevision, PageQueryBuilder,
} from '~/server/models/page';
import { createBatchStream } from '~/server/util/batch-stream';
import loggerFactory from '~/utils/logger';
import { prepareDeleteConfigValuesForCalc } from '~/utils/page-delete-config';

import { ObjectIdLike } from '../interfaces/mongoose-utils';
import { PathAlreadyExistsError } from '../models/errors';
import PageOperation, { PageOperationDocument } from '../models/page-operation';
import { PageRedirectModel } from '../models/page-redirect';
import { serializePageSecurely } from '../models/serializers/page-serializer';
import Subscription from '../models/subscription';
import { V5ConversionError } from '../models/vo/v5-conversion-error';

const debug = require('debug')('growi:services:page');

const logger = loggerFactory('growi:services:page');
const {
  isTrashPage, isTopPage, omitDuplicateAreaPageFromPages,
  collectAncestorPaths, isMovablePage, canMoveByPath, isUsersProtectedPages, hasSlash, generateChildrenRegExp,
} = pagePathUtils;

const { addTrailingSlash } = pathUtils;

const BULK_REINDEX_SIZE = 100;
const LIMIT_FOR_MULTIPLE_PAGE_OP = 20;
class PageService {

  crowi: any;

  pageEvent: any;

  tagEvent: any;

  constructor(crowi) {
    this.crowi = crowi;
    this.pageEvent = crowi.event('page');
    this.tagEvent = crowi.event('tag');

    // init
    this.initPageEvent();
  }

  private initPageEvent() {
    // create
    this.pageEvent.on('create', this.pageEvent.onCreate);

    // createMany
    this.pageEvent.on('createMany', this.pageEvent.onCreateMany);
    this.pageEvent.on('addSeenUsers', this.pageEvent.onAddSeenUsers);
  }

  canDeleteCompletely(path: string, creatorId: ObjectIdLike, operator: any | null, isRecursively: boolean): boolean {
    if (operator == null || isTopPage(path) || isUsersProtectedPages(path)) return false;

    const pageCompleteDeletionAuthority = this.crowi.configManager.getConfig('crowi', 'security:pageCompleteDeletionAuthority');
    const pageRecursiveCompleteDeletionAuthority = this.crowi.configManager.getConfig('crowi', 'security:pageRecursiveCompleteDeletionAuthority');

    const [singleAuthority, recursiveAuthority] = prepareDeleteConfigValuesForCalc(pageCompleteDeletionAuthority, pageRecursiveCompleteDeletionAuthority);

    return this.canDeleteLogic(creatorId, operator, isRecursively, singleAuthority, recursiveAuthority);
  }

  canDelete(path: string, creatorId: ObjectIdLike, operator: any | null, isRecursively: boolean): boolean {
    if (operator == null || isUsersProtectedPages(path) || isTopPage(path)) return false;

    const pageDeletionAuthority = this.crowi.configManager.getConfig('crowi', 'security:pageDeletionAuthority');
    const pageRecursiveDeletionAuthority = this.crowi.configManager.getConfig('crowi', 'security:pageRecursiveDeletionAuthority');

    const [singleAuthority, recursiveAuthority] = prepareDeleteConfigValuesForCalc(pageDeletionAuthority, pageRecursiveDeletionAuthority);

    return this.canDeleteLogic(creatorId, operator, isRecursively, singleAuthority, recursiveAuthority);
  }

  private canDeleteLogic(
      creatorId: ObjectIdLike,
      operator,
      isRecursively: boolean,
      authority: IPageDeleteConfigValueToProcessValidation | null,
      recursiveAuthority: IPageDeleteConfigValueToProcessValidation | null,
  ): boolean {
    const isAdmin = operator?.admin ?? false;
    const isOperator = operator?._id == null ? false : operator._id.equals(creatorId);

    if (isRecursively) {
      return this.compareDeleteConfig(isAdmin, isOperator, recursiveAuthority);
    }

    return this.compareDeleteConfig(isAdmin, isOperator, authority);
  }

  private compareDeleteConfig(isAdmin: boolean, isOperator: boolean, authority: IPageDeleteConfigValueToProcessValidation | null): boolean {
    if (isAdmin) {
      return true;
    }

    if (authority === PageDeleteConfigValue.Anyone || authority == null) {
      return true;
    }
    if (authority === PageDeleteConfigValue.AdminAndAuthor && isOperator) {
      return true;
    }

    return false;
  }

  filterPagesByCanDeleteCompletely(pages, user, isRecursively: boolean) {
    return pages.filter(p => p.isEmpty || this.canDeleteCompletely(p.path, p.creator, user, isRecursively));
  }

  filterPagesByCanDelete(pages, user, isRecursively: boolean) {
    return pages.filter(p => p.isEmpty || this.canDelete(p.path, p.creator, user, isRecursively));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async findPageAndMetaDataByViewer(
      pageId: string, path: string, user: IUserHasId, includeEmpty = false, isSharedPage = false,
  ): Promise<IPageWithMeta<IPageInfoAll>|null> {

    const Page = this.crowi.model('Page');

    let page: PageModel & PageDocument & HasObjectId;
    if (pageId != null) { // prioritized
      page = await Page.findByIdAndViewer(pageId, user, null, includeEmpty);
    }
    else {
      page = await Page.findByPathAndViewer(path, user, null, includeEmpty);
    }

    if (page == null) {
      return null;
    }

    if (isSharedPage) {
      return {
        data: page,
        meta: {
          isV5Compatible: isTopPage(page.path) || page.parent != null,
          isEmpty: page.isEmpty,
          isMovable: false,
          isDeletable: false,
          isAbleToDeleteCompletely: false,
          isRevertible: false,
        },
      };
    }

    const isGuestUser = user == null;
    const pageInfo = this.constructBasicPageInfo(page, isGuestUser);

    const Bookmark = this.crowi.model('Bookmark');
    const bookmarkCount = await Bookmark.countByPageId(pageId);

    const metadataForGuest = {
      ...pageInfo,
      bookmarkCount,
    };

    if (isGuestUser) {
      return {
        data: page,
        meta: metadataForGuest,
      };
    }

    const isBookmarked: boolean = (await Bookmark.findByPageIdAndUserId(pageId, user._id)) != null;
    const isLiked: boolean = page.isLiked(user);

    const subscription = await Subscription.findByUserIdAndTargetId(user._id, pageId);

    let creatorId = page.creator;
    if (page.isEmpty) {
      // Need non-empty ancestor page to get its creatorId because empty page does NOT have it.
      // Use creatorId of ancestor page to determine whether the empty page is deletable
      const notEmptyClosestAncestor = await Page.findNonEmptyClosestAncestor(page.path);
      creatorId = notEmptyClosestAncestor.creator;
    }
    const isDeletable = this.canDelete(page.path, creatorId, user, false);
    const isAbleToDeleteCompletely = this.canDeleteCompletely(page.path, creatorId, user, false); // use normal delete config

    return {
      data: page,
      meta: {
        ...metadataForGuest,
        isDeletable,
        isAbleToDeleteCompletely,
        isBookmarked,
        isLiked,
        subscriptionStatus: subscription?.status,
      },
    };
  }

  private shouldUseV4Process(page): boolean {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const isTrashPage = page.status === Page.STATUS_DELETED;
    const isPageMigrated = page.parent != null;
    const isV5Compatible = this.crowi.configManager.getConfig('crowi', 'app:isV5Compatible');
    const isRoot = isTopPage(page.path);
    const isPageRestricted = page.grant === Page.GRANT_RESTRICTED;

    const shouldUseV4Process = !isRoot && (!isV5Compatible || !isPageMigrated || isTrashPage || isPageRestricted);

    return shouldUseV4Process;
  }

  private shouldUseV4ProcessForRevert(page): boolean {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const isV5Compatible = this.crowi.configManager.getConfig('crowi', 'app:isV5Compatible');
    const isPageRestricted = page.grant === Page.GRANT_RESTRICTED;

    const shouldUseV4Process = !isV5Compatible || isPageRestricted;

    return shouldUseV4Process;
  }

  private shouldNormalizeParent(page): boolean {
    const Page = mongoose.model('Page') as unknown as PageModel;

    return page.grant !== Page.GRANT_RESTRICTED && page.grant !== Page.GRANT_SPECIFIED;
  }

  /**
   * Generate read stream to operate descendants of the specified page path
   * @param {string} targetPagePath
   * @param {User} viewer
   */
  private async generateReadStreamToOperateOnlyDescendants(targetPagePath, userToOperate) {

    const Page = this.crowi.model('Page');
    const { PageQueryBuilder } = Page;

    const builder = new PageQueryBuilder(Page.find(), true)
      .addConditionAsNotMigrated() // to avoid affecting v5 pages
      .addConditionToListOnlyDescendants(targetPagePath);

    await Page.addConditionToFilteringByViewerToEdit(builder, userToOperate);
    return builder
      .query
      .lean()
      .cursor({ batchSize: BULK_REINDEX_SIZE });
  }

  private async generateReadStreamToOperateOnlyDescendantsGraphLookup(targetId: ObjectIdLike) {
    const BATCH_SIZE = 100;

    const Page = mongoose.model('Page') as unknown as PageModel;

    const readStream = Page.aggregate([
      {
        $match: {
          _id: targetId,
        },
      },
      {
        $graphLookup: {
          from: 'pages',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parent',
          as: 'descendants',
        },
      },
      // Flatten by descendants.
      {
        $unwind: '$descendants',
      },
      {
        $replaceRoot: {
          newRoot: '$descendants',
        },
      },
      {
        $addFields: {
          pathLength: { $strLenCP: '$path' },
        },
      },
      {
        $sort: {
          pathLength: -1,
          path: 1,
        },
      },
    ]).cursor({ batchSize: BATCH_SIZE });

    return readStream;
  }

  async renamePage(page, newPagePath, user, options) {
    /*
     * Common Operation
     */
    const Page = mongoose.model('Page') as unknown as PageModel;

    const isExist = await Page.exists({ path: newPagePath });
    if (isExist) {
      throw Error(`Page already exists at ${newPagePath}`);
    }

    if (isTopPage(page.path)) {
      throw Error('It is forbidden to rename the top page');
    }

    // Separate v4 & v5 process
    const shouldUseV4Process = this.shouldUseV4Process(page);
    if (shouldUseV4Process) {
      return this.renamePageV4(page, newPagePath, user, options);
    }

    if (options.isMoveMode) {
      const fromPath = page.path;
      const toPath = newPagePath;
      const canMove = canMoveByPath(fromPath, toPath) && await Page.exists({ path: newPagePath });

      if (!canMove) {
        throw Error('Cannot move to this path.');
      }
    }

    const canOperate = await this.crowi.pageOperationService.canOperate(true, page.path, newPagePath);
    if (!canOperate) {
      throw Error(`Cannot operate rename to path "${newPagePath}" right now.`);
    }

    /*
     * Resumable Operation
     */
    let pageOp;
    try {
      pageOp = await PageOperation.create({
        actionType: PageActionType.Rename,
        actionStage: PageActionStage.Main,
        page,
        user,
        fromPath: page.path,
        toPath: newPagePath,
        options,
      });
    }
    catch (err) {
      logger.error('Failed to create PageOperation document.', err);
      throw err;
    }

    let renamedPage: PageDocument | null = null;
    try {
      renamedPage = await this.renameMainOperation(page, newPagePath, user, options, pageOp._id);
    }
    catch (err) {
      logger.error('Error occurred while running renameMainOperation', err);

      // cleanup
      await PageOperation.deleteOne({ _id: pageOp._id });

      throw err;
    }

    return renamedPage;
  }

  async renameMainOperation(page, newPagePath: string, user, options, pageOpId: ObjectIdLike) {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const updateMetadata = options.updateMetadata || false;
    // sanitize path
    newPagePath = this.crowi.xss.process(newPagePath); // eslint-disable-line no-param-reassign

    // UserGroup & Owner validation
    // use the parent's grant when target page is an empty page
    let grant;
    let grantedUserIds;
    let grantedGroupId;
    if (page.isEmpty) {
      const parent = await Page.findOne({ _id: page.parent });
      if (parent == null) {
        throw Error('parent not found');
      }
      grant = parent.grant;
      grantedUserIds = parent.grantedUsers;
      grantedGroupId = parent.grantedGroup;
    }
    else {
      grant = page.grant;
      grantedUserIds = page.grantedUsers;
      grantedGroupId = page.grantedGroup;
    }

    if (grant !== Page.GRANT_RESTRICTED) {
      let isGrantNormalized = false;
      try {
        isGrantNormalized = await this.crowi.pageGrantService.isGrantNormalized(user, newPagePath, grant, grantedUserIds, grantedGroupId, false);
      }
      catch (err) {
        logger.error(`Failed to validate grant of page at "${newPagePath}" when renaming`, err);
        throw err;
      }
      if (!isGrantNormalized) {
        throw Error(`This page cannot be renamed to "${newPagePath}" since the selected grant or grantedGroup is not assignable to this page.`);
      }
    }

    // 1. Take target off from tree
    await Page.takeOffFromTree(page._id);

    // 2. Find new parent
    let newParent;
    // If renaming to under target, run getParentAndforceCreateEmptyTree to fill new ancestors
    if (this.isRenamingToUnderTarget(page.path, newPagePath)) {
      newParent = await this.getParentAndforceCreateEmptyTree(page, newPagePath);
    }
    else {
      newParent = await this.getParentAndFillAncestorsByUser(user, newPagePath);
    }

    // 3. Put back target page to tree (also update the other attrs)
    const update: Partial<IPage> = {};
    update.path = newPagePath;
    update.parent = newParent._id;
    if (updateMetadata) {
      update.lastUpdateUser = user;
      update.updatedAt = new Date();
    }
    const renamedPage = await Page.findByIdAndUpdate(page._id, { $set: update }, { new: true });

    // 5.increase parent's descendantCount.
    // see: https://dev.growi.org/62149d019311629d4ecd91cf#Handling%20of%20descendantCount%20in%20case%20of%20unexpected%20process%20interruption
    const nToIncreaseForOperationInterruption = 1;
    await Page.incrementDescendantCountOfPageIds([newParent._id], nToIncreaseForOperationInterruption);

    // create page redirect
    if (options.createRedirectPage) {
      const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;
      await PageRedirect.create({ fromPath: page.path, toPath: newPagePath });
    }
    this.pageEvent.emit('rename');

    // Set to Sub
    const pageOp = await PageOperation.findByIdAndUpdatePageActionStage(pageOpId, PageActionStage.Sub);
    if (pageOp == null) {
      throw Error('PageOperation document not found');
    }

    /*
     * Sub Operation
     */
    this.renameSubOperation(page, newPagePath, user, options, renamedPage, pageOp._id);

    return renamedPage;
  }

  async renameSubOperation(page, newPagePath: string, user, options, renamedPage, pageOpId: ObjectIdLike): Promise<void> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const exParentId = page.parent;

    const timerObj = this.crowi.pageOperationService.autoUpdateExpiryDate(pageOpId);
    try {
    // update descendants first
      await this.renameDescendantsWithStream(page, newPagePath, user, options, false);
    }
    catch (err) {
      logger.warn(err);
      throw Error(err);
    }
    finally {
      this.crowi.pageOperationService.clearAutoUpdateInterval(timerObj);
    }

    // reduce parent's descendantCount
    // see: https://dev.growi.org/62149d019311629d4ecd91cf#Handling%20of%20descendantCount%20in%20case%20of%20unexpected%20process%20interruption
    const nToReduceForOperationInterruption = -1;
    await Page.incrementDescendantCountOfPageIds([renamedPage.parent], nToReduceForOperationInterruption);

    const nToReduce = -1 * ((page.isEmpty ? 0 : 1) + page.descendantCount);
    await this.updateDescendantCountOfAncestors(exParentId, nToReduce, true);

    // increase ancestore's descendantCount
    const nToIncrease = (renamedPage.isEmpty ? 0 : 1) + page.descendantCount;
    await this.updateDescendantCountOfAncestors(renamedPage._id, nToIncrease, false);

    // Remove leaf empty pages if not moving to under the ex-target position
    if (!this.isRenamingToUnderTarget(page.path, newPagePath)) {
    // remove empty pages at leaf position
      await Page.removeLeafEmptyPagesRecursively(page.parent);
    }

    await PageOperation.findByIdAndDelete(pageOpId);
  }

  async resumeRenameSubOperation(renamedPage: PageDocument, pageOp: PageOperationDocument): Promise<void> {
    const isProcessable = pageOp.isProcessable();
    if (!isProcessable) {
      throw Error('This page operation is currently being processed');
    }
    if (pageOp.toPath == null) {
      throw Error(`Property toPath is missing which is needed to resume rename operation(${pageOp._id})`);
    }

    const {
      page, fromPath, toPath, options, user,
    } = pageOp;

    this.fixPathsAndDescendantCountOfAncestors(page, user, options, renamedPage, pageOp._id, fromPath, toPath);
  }

  /**
   * Renaming paths and fixing descendantCount of ancestors. It shoud be run synchronously.
   * `renameSubOperation` to restart rename operation
   * `updateDescendantCountOfPagesWithPaths` to fix descendantCount of ancestors
   */
  private async fixPathsAndDescendantCountOfAncestors(page, user, options, renamedPage, pageOpId, fromPath, toPath): Promise<void> {
    await this.renameSubOperation(page, toPath, user, options, renamedPage, pageOpId);
    const ancestorsPaths = this.crowi.pageOperationService.getAncestorsPathsByFromAndToPath(fromPath, toPath);
    await this.updateDescendantCountOfPagesWithPaths(ancestorsPaths);
  }

  private isRenamingToUnderTarget(fromPath: string, toPath: string): boolean {
    const pathToTest = escapeStringRegexp(addTrailingSlash(fromPath));
    const pathToBeTested = toPath;

    return (new RegExp(`^${pathToTest}`, 'i')).test(pathToBeTested);
  }

  private async getParentAndforceCreateEmptyTree(originalPage, toPath: string) {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const fromPath = originalPage.path;
    const newParentPath = pathlib.dirname(toPath);

    // local util
    const collectAncestorPathsUntilFromPath = (path: string, paths: string[] = []): string[] => {
      if (path === fromPath) return paths;

      const parentPath = pathlib.dirname(path);
      paths.push(parentPath);
      return collectAncestorPathsUntilFromPath(parentPath, paths);
    };

    const pathsToInsert = collectAncestorPathsUntilFromPath(toPath);
    const originalParent = await Page.findById(originalPage.parent);
    if (originalParent == null) {
      throw Error('Original parent not found');
    }
    const insertedPages = await Page.insertMany(pathsToInsert.map((path) => {
      return {
        path,
        isEmpty: true,
      };
    }));

    const pages = [...insertedPages, originalParent];

    const ancestorsMap = new Map<string, PageDocument & {_id: any}>(pages.map(p => [p.path, p]));

    // bulkWrite to update ancestors
    const operations = insertedPages.map((page) => {
      const parentPath = pathlib.dirname(page.path);
      const op = {
        updateOne: {
          filter: {
            _id: page._id,
          },
          update: {
            $set: {
              parent: ancestorsMap.get(parentPath)?._id,
              descedantCount: originalParent.descendantCount,
            },
          },
        },
      };

      return op;
    });
    await Page.bulkWrite(operations);

    const newParent = ancestorsMap.get(newParentPath);
    return newParent;
  }

  private async renamePageV4(page, newPagePath, user, options) {
    const Page = this.crowi.model('Page');
    const Revision = this.crowi.model('Revision');
    const {
      isRecursively = false,
      createRedirectPage = false,
      updateMetadata = false,
    } = options;

    // sanitize path
    newPagePath = this.crowi.xss.process(newPagePath); // eslint-disable-line no-param-reassign

    // create descendants first
    if (isRecursively) {
      await this.renameDescendantsWithStream(page, newPagePath, user, options);
    }


    const update: any = {};
    // update Page
    update.path = newPagePath;
    if (updateMetadata) {
      update.lastUpdateUser = user;
      update.updatedAt = Date.now();
    }
    const renamedPage = await Page.findByIdAndUpdate(page._id, { $set: update }, { new: true });

    // update Rivisions
    await Revision.updateRevisionListByPageId(renamedPage._id, { pageId: renamedPage._id });

    if (createRedirectPage) {
      const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;
      await PageRedirect.create({ fromPath: page.path, toPath: newPagePath });
    }

    this.pageEvent.emit('rename');

    return renamedPage;
  }

  private async renameDescendants(pages, user, options, oldPagePathPrefix, newPagePathPrefix, shouldUseV4Process = true) {
    // v4 compatible process
    if (shouldUseV4Process) {
      return this.renameDescendantsV4(pages, user, options, oldPagePathPrefix, newPagePathPrefix);
    }

    const Page = mongoose.model('Page') as unknown as PageModel;
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;

    const { updateMetadata, createRedirectPage } = options;

    const updatePathOperations: any[] = [];
    const insertPageRedirectOperations: any[] = [];

    pages.forEach((page) => {
      const newPagePath = page.path.replace(oldPagePathPrefix, newPagePathPrefix);

      // increment updatePathOperations
      let update;
      if (!page.isEmpty && updateMetadata) {
        update = {
          $set: { path: newPagePath, lastUpdateUser: user._id, updatedAt: new Date() },
        };

      }
      else {
        update = {
          $set: { path: newPagePath },
        };
      }

      if (!page.isEmpty && createRedirectPage) {
        // insert PageRedirect
        insertPageRedirectOperations.push({
          insertOne: {
            document: {
              fromPath: page.path,
              toPath: newPagePath,
            },
          },
        });
      }

      updatePathOperations.push({
        updateOne: {
          filter: {
            _id: page._id,
          },
          update,
        },
      });
    });

    try {
      await Page.bulkWrite(updatePathOperations);
    }
    catch (err) {
      if (err.code !== 11000) {
        throw new Error(`Failed to rename pages: ${err}`);
      }
    }

    try {
      await PageRedirect.bulkWrite(insertPageRedirectOperations);
    }
    catch (err) {
      if (err.code !== 11000) {
        throw Error(`Failed to create PageRedirect documents: ${err}`);
      }
    }

    this.pageEvent.emit('updateMany', pages, user);
  }

  private async renameDescendantsV4(pages, user, options, oldPagePathPrefix, newPagePathPrefix) {
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;
    const pageCollection = mongoose.connection.collection('pages');
    const { updateMetadata, createRedirectPage } = options;

    const unorderedBulkOp = pageCollection.initializeUnorderedBulkOp();
    const insertPageRedirectOperations: any[] = [];

    pages.forEach((page) => {
      const newPagePath = page.path.replace(oldPagePathPrefix, newPagePathPrefix);

      if (updateMetadata) {
        unorderedBulkOp
          .find({ _id: page._id })
          .update({ $set: { path: newPagePath, lastUpdateUser: user._id, updatedAt: new Date() } });
      }
      else {
        unorderedBulkOp.find({ _id: page._id }).update({ $set: { path: newPagePath } });
      }
      // insert PageRedirect
      if (!page.isEmpty && createRedirectPage) {
        insertPageRedirectOperations.push({
          insertOne: {
            document: {
              fromPath: page.path,
              toPath: newPagePath,
            },
          },
        });
      }
    });

    try {
      await unorderedBulkOp.execute();
    }
    catch (err) {
      if (err.code !== 11000) {
        throw new Error(`Failed to rename pages: ${err}`);
      }
    }

    try {
      await PageRedirect.bulkWrite(insertPageRedirectOperations);
    }
    catch (err) {
      if (err.code !== 11000) {
        throw Error(`Failed to create PageRedirect documents: ${err}`);
      }
    }

    this.pageEvent.emit('updateMany', pages, user);
  }

  private async renameDescendantsWithStream(targetPage, newPagePath, user, options = {}, shouldUseV4Process = true) {
    // v4 compatible process
    if (shouldUseV4Process) {
      return this.renameDescendantsWithStreamV4(targetPage, newPagePath, user, options);
    }

    const readStream = await this.generateReadStreamToOperateOnlyDescendantsGraphLookup(targetPage._id);

    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(targetPage.path)}`, 'i');

    const renameDescendants = this.renameDescendants.bind(this);
    const pageEvent = this.pageEvent;
    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        try {
          count += batch.length;
          await renameDescendants(
            batch, user, options, pathRegExp, newPagePathPrefix, shouldUseV4Process,
          );
          logger.debug(`Renaming pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('Renaming error on add anyway: ', err);
        }

        callback();
      },
      async final(callback) {
        logger.debug(`Renaming pages has completed: (totalCount=${count})`);

        // update path
        targetPage.path = newPagePath;
        pageEvent.emit('syncDescendantsUpdate', targetPage, user);

        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);

    await streamToPromise(writeStream);
  }

  private async renameDescendantsWithStreamV4(targetPage, newPagePath, user, options = {}) {

    const readStream = await this.generateReadStreamToOperateOnlyDescendants(targetPage.path, user);

    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(targetPage.path)}`, 'i');

    const renameDescendants = this.renameDescendants.bind(this);
    const pageEvent = this.pageEvent;
    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        try {
          count += batch.length;
          await renameDescendants(batch, user, options, pathRegExp, newPagePathPrefix);
          logger.debug(`Renaming pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('renameDescendants error on add anyway: ', err);
        }

        callback();
      },
      final(callback) {
        logger.debug(`Renaming pages has completed: (totalCount=${count})`);
        // update  path
        targetPage.path = newPagePath;
        pageEvent.emit('syncDescendantsUpdate', targetPage, user);
        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);

    await streamToPromise(writeStream);
  }

  /*
   * Duplicate
   */
  async duplicate(page, newPagePath, user, isRecursively) {
    /*
     * Common Operation
     */
    const isEmptyAndNotRecursively = page?.isEmpty && !isRecursively;
    if (page == null || isEmptyAndNotRecursively) {
      throw new Error('Cannot find or duplicate the empty page');
    }

    const Page = mongoose.model('Page') as unknown as PageModel;
    const PageTagRelation = mongoose.model('PageTagRelation') as any; // TODO: Typescriptize model

    if (!isRecursively && page.isEmpty) {
      throw Error('Page not found.');
    }

    newPagePath = this.crowi.xss.process(newPagePath); // eslint-disable-line no-param-reassign

    // 1. Separate v4 & v5 process
    const shouldUseV4Process = this.shouldUseV4Process(page);
    if (shouldUseV4Process) {
      return this.duplicateV4(page, newPagePath, user, isRecursively);
    }

    const canOperate = await this.crowi.pageOperationService.canOperate(isRecursively, page.path, newPagePath);
    if (!canOperate) {
      throw Error(`Cannot operate duplicate to path "${newPagePath}" right now.`);
    }

    // 2. UserGroup & Owner validation
    // use the parent's grant when target page is an empty page
    let grant;
    let grantedUserIds;
    let grantedGroupId;
    if (page.isEmpty) {
      const parent = await Page.findOne({ _id: page.parent });
      if (parent == null) {
        throw Error('parent not found');
      }
      grant = parent.grant;
      grantedUserIds = parent.grantedUsers;
      grantedGroupId = parent.grantedGroup;
    }
    else {
      grant = page.grant;
      grantedUserIds = page.grantedUsers;
      grantedGroupId = page.grantedGroup;
    }

    if (grant !== Page.GRANT_RESTRICTED) {
      let isGrantNormalized = false;
      try {
        isGrantNormalized = await this.crowi.pageGrantService.isGrantNormalized(user, newPagePath, grant, grantedUserIds, grantedGroupId, false);
      }
      catch (err) {
        logger.error(`Failed to validate grant of page at "${newPagePath}" when duplicating`, err);
        throw err;
      }
      if (!isGrantNormalized) {
        throw Error(`This page cannot be duplicated to "${newPagePath}" since the selected grant or grantedGroup is not assignable to this page.`);
      }
    }

    // copy & populate (reason why copy: SubOperation only allows non-populated page document)
    const copyPage = { ...page };

    // 3. Duplicate target
    const options: PageCreateOptions = {
      grant: page.grant,
      grantUserGroupId: page.grantedGroup,
    };
    let duplicatedTarget;
    if (page.isEmpty) {
      const parent = await this.getParentAndFillAncestorsByUser(user, newPagePath);
      duplicatedTarget = await Page.createEmptyPage(newPagePath, parent);
    }
    else {
      await page.populate({ path: 'revision', model: 'Revision', select: 'body' });
      duplicatedTarget = await (this.create as CreateMethod)(
        newPagePath, page.revision.body, user, options,
      );
    }
    this.pageEvent.emit('duplicate', page, user);

    // 4. Take over tags
    const originTags = await page.findRelatedTagsById();
    let savedTags = [];
    if (originTags.length !== 0) {
      await PageTagRelation.updatePageTags(duplicatedTarget._id, originTags);
      savedTags = await PageTagRelation.listTagNamesByPage(duplicatedTarget._id);
      this.tagEvent.emit('update', duplicatedTarget, savedTags);
    }

    if (isRecursively) {
      /*
       * Resumable Operation
       */
      let pageOp;
      try {
        pageOp = await PageOperation.create({
          actionType: PageActionType.Duplicate,
          actionStage: PageActionStage.Main,
          page: copyPage,
          user,
          fromPath: page.path,
          toPath: newPagePath,
        });
      }
      catch (err) {
        logger.error('Failed to create PageOperation document.', err);
        throw err;
      }

      (async() => {
        try {
          await this.duplicateRecursivelyMainOperation(page, newPagePath, user, pageOp._id);
        }
        catch (err) {
          logger.error('Error occurred while running duplicateRecursivelyMainOperation.', err);

          // cleanup
          await PageOperation.deleteOne({ _id: pageOp._id });

          throw err;
        }
      })();
    }

    const result = serializePageSecurely(duplicatedTarget);
    result.tags = savedTags;
    return result;
  }

  async duplicateRecursivelyMainOperation(page, newPagePath: string, user, pageOpId: ObjectIdLike): Promise<void> {
    const nDuplicatedPages = await this.duplicateDescendantsWithStream(page, newPagePath, user, false);

    // normalize parent of descendant pages
    const shouldNormalize = this.shouldNormalizeParent(page);
    if (shouldNormalize) {
      try {
        await this.normalizeParentAndDescendantCountOfDescendants(newPagePath, user);
        logger.info(`Successfully normalized duplicated descendant pages under "${newPagePath}"`);
      }
      catch (err) {
        logger.error('Failed to normalize descendants afrer duplicate:', err);
        throw err;
      }
    }

    // Set to Sub
    const pageOp = await PageOperation.findByIdAndUpdatePageActionStage(pageOpId, PageActionStage.Sub);
    if (pageOp == null) {
      throw Error('PageOperation document not found');
    }

    /*
     * Sub Operation
     */
    await this.duplicateRecursivelySubOperation(newPagePath, nDuplicatedPages, pageOp._id);
  }

  async duplicateRecursivelySubOperation(newPagePath: string, nDuplicatedPages: number, pageOpId: ObjectIdLike): Promise<void> {
    const Page = mongoose.model('Page');
    const newTarget = await Page.findOne({ path: newPagePath }); // only one page will be found since duplicating to existing path is forbidden
    if (newTarget == null) {
      throw Error('No duplicated page found. Something might have gone wrong in duplicateRecursivelyMainOperation.');
    }

    await this.updateDescendantCountOfAncestors(newTarget._id, nDuplicatedPages, false);

    await PageOperation.findByIdAndDelete(pageOpId);
  }

  async duplicateV4(page, newPagePath, user, isRecursively) {
    const PageTagRelation = mongoose.model('PageTagRelation') as any; // TODO: Typescriptize model
    // populate
    await page.populate({ path: 'revision', model: 'Revision', select: 'body' });

    // create option
    const options: any = { page };
    options.grant = page.grant;
    options.grantUserGroupId = page.grantedGroup;
    options.grantedUserIds = page.grantedUsers;

    newPagePath = this.crowi.xss.process(newPagePath); // eslint-disable-line no-param-reassign

    const createdPage = await this.crowi.pageService.create(
      newPagePath, page.revision.body, user, options,
    );
    this.pageEvent.emit('duplicate', page, user);

    if (isRecursively) {
      this.duplicateDescendantsWithStream(page, newPagePath, user);
    }

    // take over tags
    const originTags = await page.findRelatedTagsById();
    let savedTags = [];
    if (originTags != null) {
      await PageTagRelation.updatePageTags(createdPage.id, originTags);
      savedTags = await PageTagRelation.listTagNamesByPage(createdPage.id);
      this.tagEvent.emit('update', createdPage, savedTags);
    }
    const result = serializePageSecurely(createdPage);
    result.tags = savedTags;

    return result;
  }

  /**
   * Receive the object with oldPageId and newPageId and duplicate the tags from oldPage to newPage
   * @param {Object} pageIdMapping e.g. key: oldPageId, value: newPageId
   */
  private async duplicateTags(pageIdMapping) {
    const PageTagRelation = mongoose.model('PageTagRelation');

    // convert pageId from string to ObjectId
    const pageIds = Object.keys(pageIdMapping);
    const stage = { $or: pageIds.map((pageId) => { return { relatedPage: new mongoose.Types.ObjectId(pageId) } }) };

    const pagesAssociatedWithTag = await PageTagRelation.aggregate([
      {
        $match: stage,
      },
      {
        $group: {
          _id: '$relatedTag',
          relatedPages: { $push: '$relatedPage' },
        },
      },
    ]);

    const newPageTagRelation: any[] = [];
    pagesAssociatedWithTag.forEach(({ _id, relatedPages }) => {
      // relatedPages
      relatedPages.forEach((pageId) => {
        newPageTagRelation.push({
          relatedPage: pageIdMapping[pageId], // newPageId
          relatedTag: _id,
        });
      });
    });

    return PageTagRelation.insertMany(newPageTagRelation, { ordered: false });
  }

  private async duplicateDescendants(pages, user, oldPagePathPrefix, newPagePathPrefix, shouldUseV4Process = true) {
    if (shouldUseV4Process) {
      return this.duplicateDescendantsV4(pages, user, oldPagePathPrefix, newPagePathPrefix);
    }

    const Page = this.crowi.model('Page');
    const Revision = this.crowi.model('Revision');

    const pageIds = pages.map(page => page._id);
    const revisions = await Revision.find({ pageId: { $in: pageIds } });

    // Mapping to set to the body of the new revision
    const pageIdRevisionMapping = {};
    revisions.forEach((revision) => {
      pageIdRevisionMapping[revision.pageId] = revision;
    });

    // key: oldPageId, value: newPageId
    const pageIdMapping = {};
    const newPages: any[] = [];
    const newRevisions: any[] = [];

    // no need to save parent here
    pages.forEach((page) => {
      const newPageId = new mongoose.Types.ObjectId();
      const newPagePath = page.path.replace(oldPagePathPrefix, newPagePathPrefix);
      const revisionId = new mongoose.Types.ObjectId();
      pageIdMapping[page._id] = newPageId;

      let newPage;
      if (!page.isEmpty) {
        newPage = {
          _id: newPageId,
          path: newPagePath,
          creator: user._id,
          grant: page.grant,
          grantedGroup: page.grantedGroup,
          grantedUsers: page.grantedUsers,
          lastUpdateUser: user._id,
          revision: revisionId,
        };
        newRevisions.push({
          _id: revisionId, pageId: newPageId, body: pageIdRevisionMapping[page._id].body, author: user._id, format: 'markdown',
        });
      }
      newPages.push(newPage);
    });

    await Page.insertMany(newPages, { ordered: false });
    await Revision.insertMany(newRevisions, { ordered: false });
    await this.duplicateTags(pageIdMapping);
  }

  private async duplicateDescendantsV4(pages, user, oldPagePathPrefix, newPagePathPrefix) {
    const Page = this.crowi.model('Page');
    const Revision = this.crowi.model('Revision');

    const pageIds = pages.map(page => page._id);
    const revisions = await Revision.find({ pageId: { $in: pageIds } });

    // Mapping to set to the body of the new revision
    const pageIdRevisionMapping = {};
    revisions.forEach((revision) => {
      pageIdRevisionMapping[revision.pageId] = revision;
    });

    // key: oldPageId, value: newPageId
    const pageIdMapping = {};
    const newPages: any[] = [];
    const newRevisions: any[] = [];

    pages.forEach((page) => {
      const newPageId = new mongoose.Types.ObjectId();
      const newPagePath = page.path.replace(oldPagePathPrefix, newPagePathPrefix);
      const revisionId = new mongoose.Types.ObjectId();
      pageIdMapping[page._id] = newPageId;

      newPages.push({
        _id: newPageId,
        path: newPagePath,
        creator: user._id,
        grant: page.grant,
        grantedGroup: page.grantedGroup,
        grantedUsers: page.grantedUsers,
        lastUpdateUser: user._id,
        revision: revisionId,
      });

      newRevisions.push({
        _id: revisionId, pageId: newPageId, body: pageIdRevisionMapping[page._id].body, author: user._id, format: 'markdown',
      });

    });

    await Page.insertMany(newPages, { ordered: false });
    await Revision.insertMany(newRevisions, { ordered: false });
    await this.duplicateTags(pageIdMapping);
  }

  private async duplicateDescendantsWithStream(page, newPagePath, user, shouldUseV4Process = true) {
    if (shouldUseV4Process) {
      return this.duplicateDescendantsWithStreamV4(page, newPagePath, user);
    }

    const readStream = await this.generateReadStreamToOperateOnlyDescendantsGraphLookup(page._id);

    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(page.path)}`, 'i');

    const duplicateDescendants = this.duplicateDescendants.bind(this);
    const pageEvent = this.pageEvent;
    let count = 0;
    let nNonEmptyDuplicatedPages = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        try {
          count += batch.length;
          nNonEmptyDuplicatedPages += batch.filter(page => !page.isEmpty).length;
          await duplicateDescendants(batch, user, pathRegExp, newPagePathPrefix, shouldUseV4Process);
          logger.debug(`Adding pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('addAllPages error on add anyway: ', err);
        }

        callback();
      },
      async final(callback) {
        logger.debug(`Adding pages has completed: (totalCount=${count})`);
        // update  path
        page.path = newPagePath;
        pageEvent.emit('syncDescendantsUpdate', page, user);
        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);

    await streamToPromise(writeStream);

    return nNonEmptyDuplicatedPages;
  }

  private async duplicateDescendantsWithStreamV4(page, newPagePath, user) {
    const readStream = await this.generateReadStreamToOperateOnlyDescendants(page.path, user);

    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(page.path)}`, 'i');

    const duplicateDescendants = this.duplicateDescendants.bind(this);
    const pageEvent = this.pageEvent;
    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        try {
          count += batch.length;
          await duplicateDescendants(batch, user, pathRegExp, newPagePathPrefix);
          logger.debug(`Adding pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('addAllPages error on add anyway: ', err);
        }

        callback();
      },
      final(callback) {
        logger.debug(`Adding pages has completed: (totalCount=${count})`);
        // update  path
        page.path = newPagePath;
        pageEvent.emit('syncDescendantsUpdate', page, user);
        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);

    await streamToPromise(writeStream);

    return count;
  }

  /*
   * Delete
   */
  async deletePage(page, user, options = {}, isRecursively = false) {
    /*
     * Common Operation
     */
    const Page = mongoose.model('Page') as PageModel;

    // Separate v4 & v5 process
    const shouldUseV4Process = this.shouldUseV4Process(page);
    if (shouldUseV4Process) {
      return this.deletePageV4(page, user, options, isRecursively);
    }
    // Validate
    if (page.isEmpty && !isRecursively) {
      throw Error('Page not found.');
    }
    const isTrashed = isTrashPage(page.path);
    if (isTrashed) {
      throw new Error('This method does NOT support deleting trashed pages.');
    }

    if (!isMovablePage(page.path)) {
      throw new Error('Page is not deletable.');
    }

    const newPath = Page.getDeletedPageName(page.path);

    const canOperate = await this.crowi.pageOperationService.canOperate(isRecursively, page.path, newPath);
    if (!canOperate) {
      throw Error(`Cannot operate delete to path "${newPath}" right now.`);
    }

    // Replace with an empty page
    const isChildrenExist = await Page.exists({ parent: page._id });
    const shouldReplace = !isRecursively && isChildrenExist;
    if (shouldReplace) {
      await Page.replaceTargetWithPage(page, null, true);
    }

    // Delete target (only updating an existing document's properties )
    let deletedPage;
    if (!page.isEmpty) {
      deletedPage = await this.deleteNonEmptyTarget(page, user);
    }
    else { // always recursive
      deletedPage = page;
      await Page.deleteOne({ _id: page._id, isEmpty: true });
    }

    // 1. Update descendantCount
    if (isRecursively) {
      const inc = page.isEmpty ? -page.descendantCount : -(page.descendantCount + 1);
      await this.updateDescendantCountOfAncestors(page.parent, inc, true);
    }
    else {
      // update descendantCount of ancestors'
      await this.updateDescendantCountOfAncestors(page.parent, -1, true);
    }
    // 2. Delete leaf empty pages
    await Page.removeLeafEmptyPagesRecursively(page.parent);

    if (isRecursively) {
      let pageOp;
      try {
        pageOp = await PageOperation.create({
          actionType: PageActionType.Delete,
          actionStage: PageActionStage.Main,
          page,
          user,
          fromPath: page.path,
          toPath: newPath,
        });
      }
      catch (err) {
        logger.error('Failed to create PageOperation document.', err);
        throw err;
      }
      /*
       * Resumable Operation
       */
      (async() => {
        try {
          await this.deleteRecursivelyMainOperation(page, user, pageOp._id);
        }
        catch (err) {
          logger.error('Error occurred while running deleteRecursivelyMainOperation.', err);

          // cleanup
          await PageOperation.deleteOne({ _id: pageOp._id });

          throw err;
        }
      })();
    }

    return deletedPage;
  }

  private async deleteNonEmptyTarget(page, user) {
    const Page = mongoose.model('Page') as unknown as PageModel;
    const PageTagRelation = mongoose.model('PageTagRelation') as any; // TODO: Typescriptize model
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;
    const newPath = Page.getDeletedPageName(page.path);

    const deletedPage = await Page.findByIdAndUpdate(page._id, {
      $set: {
        path: newPath, status: Page.STATUS_DELETED, deleteUser: user._id, deletedAt: Date.now(), parent: null, descendantCount: 0, // set parent as null
      },
    }, { new: true });

    await PageTagRelation.updateMany({ relatedPage: page._id }, { $set: { isPageTrashed: true } });
    try {
      await PageRedirect.create({ fromPath: page.path, toPath: newPath });
    }
    catch (err) {
      if (err.code !== 11000) {
        throw err;
      }
    }
    this.pageEvent.emit('delete', page, user);
    this.pageEvent.emit('create', deletedPage, user);

    return deletedPage;
  }

  async deleteRecursivelyMainOperation(page, user, pageOpId: ObjectIdLike): Promise<void> {
    await this.deleteDescendantsWithStream(page, user, false);

    await PageOperation.findByIdAndDelete(pageOpId);

    // no sub operation available
  }

  private async deletePageV4(page, user, options = {}, isRecursively = false) {
    const Page = mongoose.model('Page') as PageModel;
    const PageTagRelation = mongoose.model('PageTagRelation') as any; // TODO: Typescriptize model
    const Revision = mongoose.model('Revision') as any; // TODO: Typescriptize model
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;

    const newPath = Page.getDeletedPageName(page.path);
    const isTrashed = isTrashPage(page.path);

    if (isTrashed) {
      throw new Error('This method does NOT support deleting trashed pages.');
    }

    if (!isMovablePage(page.path)) {
      throw new Error('Page is not deletable.');
    }

    if (isRecursively) {
      this.deleteDescendantsWithStream(page, user);
    }

    // update Revisions
    await Revision.updateRevisionListByPageId(page._id, { pageId: page._id });
    const deletedPage = await Page.findByIdAndUpdate(page._id, {
      $set: {
        path: newPath, status: Page.STATUS_DELETED, deleteUser: user._id, deletedAt: Date.now(),
      },
    }, { new: true });
    await PageTagRelation.updateMany({ relatedPage: page._id }, { $set: { isPageTrashed: true } });

    try {
      await PageRedirect.create({ fromPath: page.path, toPath: newPath });
    }
    catch (err) {
      if (err.code !== 11000) {
        throw err;
      }
    }

    this.pageEvent.emit('delete', page, user);
    this.pageEvent.emit('create', deletedPage, user);

    return deletedPage;
  }

  private async deleteDescendants(pages, user) {
    const Page = mongoose.model('Page') as unknown as PageModel;
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;

    const deletePageOperations: any[] = [];
    const insertPageRedirectOperations: any[] = [];

    pages.forEach((page) => {
      const newPath = Page.getDeletedPageName(page.path);

      let operation;
      // if empty, delete completely
      if (page.isEmpty) {
        operation = {
          deleteOne: {
            filter: { _id: page._id },
          },
        };
      }
      // if not empty, set parent to null and update to trash
      else {
        operation = {
          updateOne: {
            filter: { _id: page._id },
            update: {
              $set: {
                path: newPath, status: Page.STATUS_DELETED, deleteUser: user._id, deletedAt: Date.now(), parent: null, descendantCount: 0, // set parent as null
              },
            },
          },
        };

        insertPageRedirectOperations.push({
          insertOne: {
            document: {
              fromPath: page.path,
              toPath: newPath,
            },
          },
        });
      }

      deletePageOperations.push(operation);
    });

    try {
      await Page.bulkWrite(deletePageOperations);
    }
    catch (err) {
      if (err.code !== 11000) {
        throw new Error(`Failed to delete pages: ${err}`);
      }
    }
    finally {
      this.pageEvent.emit('syncDescendantsDelete', pages, user);
    }

    try {
      await PageRedirect.bulkWrite(insertPageRedirectOperations);
    }
    catch (err) {
      if (err.code !== 11000) {
        throw Error(`Failed to create PageRedirect documents: ${err}`);
      }
    }
  }

  /**
   * Create delete stream and return deleted document count
   */
  private async deleteDescendantsWithStream(targetPage, user, shouldUseV4Process = true): Promise<number> {
    let readStream;
    if (shouldUseV4Process) {
      readStream = await this.generateReadStreamToOperateOnlyDescendants(targetPage.path, user);
    }
    else {
      readStream = await this.generateReadStreamToOperateOnlyDescendantsGraphLookup(targetPage._id);
    }


    const deleteDescendants = this.deleteDescendants.bind(this);
    let count = 0;
    let nDeletedNonEmptyPages = 0; // used for updating descendantCount

    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        nDeletedNonEmptyPages += batch.filter(d => !d.isEmpty).length;

        try {
          count += batch.length;
          await deleteDescendants(batch, user);
          logger.debug(`Deleting pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('deleteDescendants error on add anyway: ', err);
        }

        callback();
      },
      final(callback) {
        logger.debug(`Deleting pages has completed: (totalCount=${count})`);

        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);

    await streamToPromise(writeStream);

    return nDeletedNonEmptyPages;
  }

  private async deleteCompletelyOperation(pageIds, pagePaths) {
    // Delete Bookmarks, Attachments, Revisions, Pages and emit delete
    const Bookmark = this.crowi.model('Bookmark');
    const Comment = this.crowi.model('Comment');
    const Page = this.crowi.model('Page');
    const PageTagRelation = this.crowi.model('PageTagRelation');
    const ShareLink = this.crowi.model('ShareLink');
    const Revision = this.crowi.model('Revision');
    const Attachment = this.crowi.model('Attachment');
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;

    const { attachmentService } = this.crowi;
    const attachments = await Attachment.find({ page: { $in: pageIds } });

    return Promise.all([
      Bookmark.deleteMany({ page: { $in: pageIds } }),
      Comment.deleteMany({ page: { $in: pageIds } }),
      PageTagRelation.deleteMany({ relatedPage: { $in: pageIds } }),
      ShareLink.deleteMany({ relatedPage: { $in: pageIds } }),
      Revision.deleteMany({ pageId: { $in: pageIds } }),
      Page.deleteMany({ _id: { $in: pageIds } }),
      PageRedirect.deleteMany({ $or: [{ fromPath: { $in: pagePaths } }, { toPath: { $in: pagePaths } }] }),
      attachmentService.removeAllAttachments(attachments),
    ]);
  }

  // delete multiple pages
  private async deleteMultipleCompletely(pages, user, options = {}) {
    const ids = pages.map(page => (page._id));
    const paths = pages.map(page => (page.path));

    logger.debug('Deleting completely', paths);

    await this.deleteCompletelyOperation(ids, paths);

    this.pageEvent.emit('syncDescendantsDelete', pages, user); // update as renamed page

    return;
  }

  async deleteCompletely(page, user, options = {}, isRecursively = false, preventEmitting = false) {
    /*
     * Common Operation
     */
    const Page = mongoose.model('Page') as PageModel;

    if (isTopPage(page.path)) {
      throw Error('It is forbidden to delete the top page');
    }

    if (page.isEmpty && !isRecursively) {
      throw Error('Page not found.');
    }

    // v4 compatible process
    const shouldUseV4Process = this.shouldUseV4Process(page);
    if (shouldUseV4Process) {
      return this.deleteCompletelyV4(page, user, options, isRecursively, preventEmitting);
    }

    const canOperate = await this.crowi.pageOperationService.canOperate(isRecursively, page.path, null);
    if (!canOperate) {
      throw Error(`Cannot operate deleteCompletely from path "${page.path}" right now.`);
    }

    logger.debug('Deleting completely', page.path);

    // 1. update descendantCount
    if (isRecursively) {
      const inc = page.isEmpty ? -page.descendantCount : -(page.descendantCount + 1);
      await this.updateDescendantCountOfAncestors(page.parent, inc, true);
    }
    else {
      // replace with an empty page
      const shouldReplace = await Page.exists({ parent: page._id });
      let pageToUpdateDescendantCount = page;
      if (shouldReplace) {
        pageToUpdateDescendantCount = await Page.replaceTargetWithPage(page);
      }
      await this.updateDescendantCountOfAncestors(pageToUpdateDescendantCount.parent, -1, true);
    }
    // 2. then delete target completely
    await this.deleteCompletelyOperation([page._id], [page.path]);

    // delete leaf empty pages
    await Page.removeLeafEmptyPagesRecursively(page.parent);

    if (!page.isEmpty && !preventEmitting) {
      this.pageEvent.emit('deleteCompletely', page, user);
    }

    if (isRecursively) {
      let pageOp;
      try {
        pageOp = await PageOperation.create({
          actionType: PageActionType.DeleteCompletely,
          actionStage: PageActionStage.Main,
          page,
          user,
          fromPath: page.path,
          options,
        });
      }
      catch (err) {
        logger.error('Failed to create PageOperation document.', err);
        throw err;
      }
      /*
       * Main Operation
       */
      (async() => {
        try {
          await this.deleteCompletelyRecursivelyMainOperation(page, user, options, pageOp._id);
        }
        catch (err) {
          logger.error('Error occurred while running deleteCompletelyRecursivelyMainOperation.', err);

          // cleanup
          await PageOperation.deleteOne({ _id: pageOp._id });

          throw err;
        }
      })();
    }

    return;
  }

  async deleteCompletelyRecursivelyMainOperation(page, user, options, pageOpId: ObjectIdLike): Promise<void> {
    await this.deleteCompletelyDescendantsWithStream(page, user, options, false);

    await PageOperation.findByIdAndDelete(pageOpId);

    // no sub operation available
  }

  private async deleteCompletelyV4(page, user, options = {}, isRecursively = false, preventEmitting = false) {
    const ids = [page._id];
    const paths = [page.path];

    logger.debug('Deleting completely', paths);

    await this.deleteCompletelyOperation(ids, paths);

    if (isRecursively) {
      this.deleteCompletelyDescendantsWithStream(page, user, options);
    }

    if (!page.isEmpty && !preventEmitting) {
      this.pageEvent.emit('deleteCompletely', page, user);
    }

    return;
  }

  async emptyTrashPage(user, options = {}) {
    return this.deleteCompletelyDescendantsWithStream({ path: '/trash' }, user, options);
  }

  /**
   * Create delete completely stream
   */
  private async deleteCompletelyDescendantsWithStream(targetPage, user, options = {}, shouldUseV4Process = true): Promise<number> {
    let readStream;

    if (shouldUseV4Process) { // pages don't have parents
      readStream = await this.generateReadStreamToOperateOnlyDescendants(targetPage.path, user);
    }
    else {
      readStream = await this.generateReadStreamToOperateOnlyDescendantsGraphLookup(targetPage._id);
    }

    let count = 0;
    let nDeletedNonEmptyPages = 0; // used for updating descendantCount

    const deleteMultipleCompletely = this.deleteMultipleCompletely.bind(this);
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        nDeletedNonEmptyPages += batch.filter(d => !d.isEmpty).length;

        try {
          count += batch.length;
          await deleteMultipleCompletely(batch, user, options);
          logger.debug(`Adding pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('addAllPages error on add anyway: ', err);
        }

        callback();
      },
      final(callback) {
        logger.debug(`Adding pages has completed: (totalCount=${count})`);

        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);

    await streamToPromise(writeStream);

    return nDeletedNonEmptyPages;
  }

  // no need to separate Main Sub since it is devided into single page operations
  async deleteMultiplePages(pagesToDelete, user, options): Promise<void> {
    const { isRecursively, isCompletely } = options;

    if (pagesToDelete.length > LIMIT_FOR_MULTIPLE_PAGE_OP) {
      throw Error(`The maximum number of pages is ${LIMIT_FOR_MULTIPLE_PAGE_OP}.`);
    }

    // omit duplicate paths if isRecursively true, omit empty pages if isRecursively false
    const pages = isRecursively ? omitDuplicateAreaPageFromPages(pagesToDelete) : pagesToDelete.filter(p => !p.isEmpty);

    if (isCompletely) {
      for await (const page of pages) {
        await this.deleteCompletely(page, user, {}, isRecursively);
      }
    }
    else {
      for await (const page of pages) {
        await this.deletePage(page, user, {}, isRecursively);
      }
    }
  }

  // use the same process in both v4 and v5
  private async revertDeletedDescendants(pages, user) {
    const Page = this.crowi.model('Page');
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;

    const revertPageOperations: any[] = [];
    const fromPathsToDelete: string[] = [];

    pages.forEach((page) => {
      // e.g. page.path = /trash/test, toPath = /test
      const toPath = Page.getRevertDeletedPageName(page.path);
      revertPageOperations.push({
        updateOne: {
          filter: { _id: page._id },
          update: {
            $set: {
              path: toPath, status: Page.STATUS_PUBLISHED, lastUpdateUser: user._id, deleteUser: null, deletedAt: null,
            },
          },
        },
      });

      fromPathsToDelete.push(page.path);
    });

    try {
      await Page.bulkWrite(revertPageOperations);
      await PageRedirect.deleteMany({ fromPath: { $in: fromPathsToDelete } });
    }
    catch (err) {
      if (err.code !== 11000) {
        throw new Error(`Failed to revert pages: ${err}`);
      }
    }
  }

  async revertDeletedPage(page, user, options = {}, isRecursively = false) {
    /*
     * Common Operation
     */
    const Page = this.crowi.model('Page');
    const PageTagRelation = this.crowi.model('PageTagRelation');

    // 1. Separate v4 & v5 process
    const shouldUseV4Process = this.shouldUseV4ProcessForRevert(page);
    if (shouldUseV4Process) {
      return this.revertDeletedPageV4(page, user, options, isRecursively);
    }

    const newPath = Page.getRevertDeletedPageName(page.path);

    const canOperate = await this.crowi.pageOperationService.canOperate(isRecursively, page.path, newPath);
    if (!canOperate) {
      throw Error(`Cannot operate revert from path "${page.path}" right now.`);
    }

    const includeEmpty = true;
    const originPage = await Page.findByPath(newPath, includeEmpty);

    // throw if any page already exists
    if (originPage != null) {
      throw new PathAlreadyExistsError('already_exists', originPage.path);
    }

    // 2. Revert target
    const parent = await this.getParentAndFillAncestorsByUser(user, newPath);
    const updatedPage = await Page.findByIdAndUpdate(page._id, {
      $set: {
        path: newPath, status: Page.STATUS_PUBLISHED, lastUpdateUser: user._id, deleteUser: null, deletedAt: null, parent: parent._id, descendantCount: 0,
      },
    }, { new: true });
    await PageTagRelation.updateMany({ relatedPage: page._id }, { $set: { isPageTrashed: false } });

    this.pageEvent.emit('revert', page, user);

    if (!isRecursively) {
      await this.updateDescendantCountOfAncestors(parent._id, 1, true);
    }
    else {
      let pageOp;
      try {
        pageOp = await PageOperation.create({
          actionType: PageActionType.Revert,
          actionStage: PageActionStage.Main,
          page,
          user,
          fromPath: page.path,
          toPath: newPath,
          options,
        });
      }
      catch (err) {
        logger.error('Failed to create PageOperation document.', err);
        throw err;
      }
      /*
       * Resumable Operation
       */
      (async() => {
        try {
          await this.revertRecursivelyMainOperation(page, user, options, pageOp._id);
        }
        catch (err) {
          logger.error('Error occurred while running revertRecursivelyMainOperation.', err);

          // cleanup
          await PageOperation.deleteOne({ _id: pageOp._id });

          throw err;
        }
      })();
    }

    return updatedPage;
  }

  async revertRecursivelyMainOperation(page, user, options, pageOpId: ObjectIdLike): Promise<void> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    await this.revertDeletedDescendantsWithStream(page, user, options, false);

    const newPath = Page.getRevertDeletedPageName(page.path);
    // normalize parent of descendant pages
    const shouldNormalize = this.shouldNormalizeParent(page);
    if (shouldNormalize) {
      try {
        await this.normalizeParentAndDescendantCountOfDescendants(newPath, user);
        logger.info(`Successfully normalized reverted descendant pages under "${newPath}"`);
      }
      catch (err) {
        logger.error('Failed to normalize descendants afrer revert:', err);
        throw err;
      }
    }

    // Set to Sub
    const pageOp = await PageOperation.findByIdAndUpdatePageActionStage(pageOpId, PageActionStage.Sub);
    if (pageOp == null) {
      throw Error('PageOperation document not found');
    }

    /*
     * Sub Operation
     */
    await this.revertRecursivelySubOperation(newPath, pageOp._id);
  }

  async revertRecursivelySubOperation(newPath: string, pageOpId: ObjectIdLike): Promise<void> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const newTarget = await Page.findOne({ path: newPath }); // only one page will be found since duplicating to existing path is forbidden

    if (newTarget == null) {
      throw Error('No reverted page found. Something might have gone wrong in revertRecursivelyMainOperation.');
    }

    // update descendantCount of ancestors'
    await this.updateDescendantCountOfAncestors(newTarget.parent as ObjectIdLike, newTarget.descendantCount + 1, true);

    await PageOperation.findByIdAndDelete(pageOpId);
  }

  private async revertDeletedPageV4(page, user, options = {}, isRecursively = false) {
    const Page = this.crowi.model('Page');
    const PageTagRelation = this.crowi.model('PageTagRelation');

    const newPath = Page.getRevertDeletedPageName(page.path);
    const originPage = await Page.findByPath(newPath);
    if (originPage != null) {
      throw new PathAlreadyExistsError('already_exists', originPage.path);
    }

    if (isRecursively) {
      this.revertDeletedDescendantsWithStream(page, user, options);
    }

    page.status = Page.STATUS_PUBLISHED;
    page.lastUpdateUser = user;
    debug('Revert deleted the page', page, newPath);
    const updatedPage = await Page.findByIdAndUpdate(page._id, {
      $set: {
        path: newPath, status: Page.STATUS_PUBLISHED, lastUpdateUser: user._id, deleteUser: null, deletedAt: null,
      },
    }, { new: true });
    await PageTagRelation.updateMany({ relatedPage: page._id }, { $set: { isPageTrashed: false } });

    this.pageEvent.emit('revert', page, user);

    return updatedPage;
  }

  /**
   * Create revert stream
   */
  private async revertDeletedDescendantsWithStream(targetPage, user, options = {}, shouldUseV4Process = true): Promise<number> {
    if (shouldUseV4Process) {
      return this.revertDeletedDescendantsWithStreamV4(targetPage, user, options);
    }

    const readStream = await this.generateReadStreamToOperateOnlyDescendants(targetPage.path, user);

    const revertDeletedDescendants = this.revertDeletedDescendants.bind(this);
    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        try {
          count += batch.length;
          await revertDeletedDescendants(batch, user);
          logger.debug(`Reverting pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('revertPages error on add anyway: ', err);
        }

        callback();
      },
      async final(callback) {
        logger.debug(`Reverting pages has completed: (totalCount=${count})`);

        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);

    await streamToPromise(writeStream);

    return count;
  }

  private async revertDeletedDescendantsWithStreamV4(targetPage, user, options = {}) {
    const readStream = await this.generateReadStreamToOperateOnlyDescendants(targetPage.path, user);

    const revertDeletedDescendants = this.revertDeletedDescendants.bind(this);
    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        try {
          count += batch.length;
          await revertDeletedDescendants(batch, user);
          logger.debug(`Reverting pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('revertPages error on add anyway: ', err);
        }

        callback();
      },
      final(callback) {
        logger.debug(`Reverting pages has completed: (totalCount=${count})`);

        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);

    await streamToPromise(writeStream);

    return count;
  }


  async handlePrivatePagesForGroupsToDelete(groupsToDelete, action, transferToUserGroupId, user) {
    const Page = this.crowi.model('Page');
    const pages = await Page.find({ grantedGroup: { $in: groupsToDelete } });

    switch (action) {
      case 'public':
        await Page.publicizePages(pages);
        break;
      case 'delete':
        return this.deleteMultipleCompletely(pages, user);
      case 'transfer':
        await Page.transferPagesToGroup(pages, transferToUserGroupId);
        break;
      default:
        throw new Error('Unknown action for private pages');
    }
  }

  private extractStringIds(refs: Ref<HasObjectId>[]) {
    return refs.map((ref: Ref<HasObjectId>) => {
      return (typeof ref === 'string') ? ref : ref._id.toString();
    });
  }

  constructBasicPageInfo(page: IPage, isGuestUser?: boolean): IPageInfo | IPageInfoForEntity {
    const isMovable = isGuestUser ? false : isMovablePage(page.path);

    if (page.isEmpty) {
      return {
        isV5Compatible: true,
        isEmpty: true,
        isMovable,
        isDeletable: false,
        isAbleToDeleteCompletely: false,
        isRevertible: false,
      };
    }

    const likers = page.liker.slice(0, 15) as Ref<IUserHasId>[];
    const seenUsers = page.seenUsers.slice(0, 15) as Ref<IUserHasId>[];
    const expandContentWidth = page.expandContentWidth ?? this.crowi.configManager.getConfig('crowi', 'customize:isContainerFluid');

    return {
      isV5Compatible: isTopPage(page.path) || page.parent != null,
      isEmpty: false,
      sumOfLikers: page.liker.length,
      likerIds: this.extractStringIds(likers),
      seenUserIds: this.extractStringIds(seenUsers),
      sumOfSeenUsers: page.seenUsers.length,
      isMovable,
      isDeletable: isMovable,
      isAbleToDeleteCompletely: false,
      isRevertible: isTrashPage(page.path),
      expandContentWidth,
    };

  }

  async shortBodiesMapByPageIds(pageIds: ObjectId[] = [], user): Promise<Record<string, string | null>> {
    const Page = mongoose.model('Page') as unknown as PageModel;
    const MAX_LENGTH = 350;

    // aggregation options
    let userGroups;
    if (user != null && userGroups == null) {
      const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // Typescriptize model
      userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
    }
    const viewerCondition = Page.generateGrantCondition(user, userGroups);
    const filterByIds = {
      _id: { $in: pageIds },
    };

    let pages;
    try {
      pages = await Page
        .aggregate([
          // filter by pageIds
          {
            $match: filterByIds,
          },
          // filter by viewer
          {
            $match: viewerCondition,
          },
          // lookup: https://docs.mongodb.com/v4.4/reference/operator/aggregation/lookup/
          {
            $lookup: {
              from: 'revisions',
              let: { localRevision: '$revision' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$localRevision'],
                    },
                  },
                },
                {
                  $project: {
                    // What is $substrCP?
                    // see: https://stackoverflow.com/questions/43556024/mongodb-error-substrbytes-invalid-range-ending-index-is-in-the-middle-of-a-ut/43556249
                    revision: { $substrCP: ['$body', 0, MAX_LENGTH] },
                  },
                },
              ],
              as: 'revisionData',
            },
          },
          // projection
          {
            $project: {
              _id: 1,
              revisionData: 1,
            },
          },
        ]).exec();
    }
    catch (err) {
      logger.error('Error occurred while generating shortBodiesMap');
      throw err;
    }

    const shortBodiesMap = {};
    pages.forEach((page) => {
      shortBodiesMap[page._id] = page.revisionData?.[0]?.revision;
    });

    return shortBodiesMap;
  }

  async normalizeParentByPath(path: string, user): Promise<void> {
    const Page = mongoose.model('Page') as unknown as PageModel;
    const { PageQueryBuilder } = Page;

    // This validation is not 100% correct since it ignores user to count
    const builder = new PageQueryBuilder(Page.find());
    builder.addConditionAsNotMigrated();
    builder.addConditionToListWithDescendants(path);
    const nEstimatedNormalizationTarget: number = await builder.query.exec('count');
    if (nEstimatedNormalizationTarget === 0) {
      throw Error('No page is available for conversion');
    }

    const pages = await Page.findByPathAndViewer(path, user, null, false);
    if (pages == null || !Array.isArray(pages)) {
      throw Error('Something went wrong while converting pages.');
    }


    if (pages.length === 0) {
      const isForbidden = await Page.count({ path, isEmpty: false }) > 0;
      if (isForbidden) {
        throw new V5ConversionError('It is not allowed to convert this page.', V5ConversionErrCode.FORBIDDEN);
      }
    }
    if (pages.length > 1) {
      throw new V5ConversionError(
        `There are more than two pages at the path "${path}". Please rename or delete the page first.`,
        V5ConversionErrCode.DUPLICATE_PAGES_FOUND,
      );
    }

    let page;
    let systematicallyCreatedPage;

    const shouldCreateNewPage = pages[0] == null;
    if (shouldCreateNewPage) {
      const notEmptyParent = await Page.findNotEmptyParentByPathRecursively(path);

      const options: PageCreateOptions & { grantedUsers?: ObjectIdLike[] | undefined } = {
        grant: notEmptyParent.grant,
        grantUserGroupId: notEmptyParent.grantedGroup,
        grantedUsers: notEmptyParent.grantedUsers,
      };

      systematicallyCreatedPage = await this.forceCreateBySystem(
        path,
        '',
        options,
      );
      page = systematicallyCreatedPage;
    }
    else {
      page = pages[0];
    }

    const grant = page.grant;
    const grantedUserIds = page.grantedUsers;
    const grantedGroupId = page.grantedGroup;

    /*
     * UserGroup & Owner validation
     */
    let isGrantNormalized = false;
    try {
      const shouldCheckDescendants = true;

      isGrantNormalized = await this.crowi.pageGrantService.isGrantNormalized(user, path, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);
    }
    catch (err) {
      logger.error(`Failed to validate grant of page at "${path}"`, err);
      throw err;
    }
    if (!isGrantNormalized) {
      throw new V5ConversionError(
        'This page cannot be migrated since the selected grant or grantedGroup is not assignable to this page.',
        V5ConversionErrCode.GRANT_INVALID,
      );
    }

    let pageOp;
    try {
      pageOp = await PageOperation.create({
        actionType: PageActionType.NormalizeParent,
        actionStage: PageActionStage.Main,
        page,
        user,
        fromPath: page.path,
        toPath: page.path,
      });
    }
    catch (err) {
      logger.error('Failed to create PageOperation document.', err);
      throw err;
    }

    (async() => {
      try {
        await this.normalizeParentRecursivelyMainOperation(page, user, pageOp._id);
      }
      catch (err) {
        logger.error('Error occurred while running normalizeParentRecursivelyMainOperation.', err);

        // cleanup
        await PageOperation.deleteOne({ _id: pageOp._id });

        throw err;
      }
    })();
  }

  async normalizeParentByPageIdsRecursively(pageIds: ObjectIdLike[], user): Promise<void> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const pages = await Page.findByIdsAndViewer(pageIds, user, null);

    if (pages == null || pages.length === 0) {
      throw Error('pageIds is null or 0 length.');
    }

    if (pages.length > LIMIT_FOR_MULTIPLE_PAGE_OP) {
      throw Error(`The maximum number of pageIds allowed is ${LIMIT_FOR_MULTIPLE_PAGE_OP}.`);
    }

    this.normalizeParentRecursivelyByPages(pages, user);

    return;
  }

  async normalizeParentByPageIds(pageIds: ObjectIdLike[], user): Promise<void> {
    const Page = await mongoose.model('Page') as unknown as PageModel;

    const socket = this.crowi.socketIoService.getDefaultSocket();

    for await (const pageId of pageIds) {
      const page = await Page.findById(pageId);
      if (page == null) {
        continue;
      }

      const errorData: PageMigrationErrorData = { paths: [page.path] };

      try {
        const canOperate = await this.crowi.pageOperationService.canOperate(false, page.path, page.path);
        if (!canOperate) {
          throw Error(`Cannot operate normalizeParent to path "${page.path}" right now.`);
        }

        const normalizedPage = await this.normalizeParentByPage(page, user);

        if (normalizedPage == null) {
          socket.emit(SocketEventName.PageMigrationError, errorData);
          logger.error(`Failed to update descendantCount of page of id: "${pageId}"`);
        }
      }
      catch (err) {
        socket.emit(SocketEventName.PageMigrationError, errorData);
        logger.error('Something went wrong while normalizing parent.', err);
      }
    }
    socket.emit(SocketEventName.PageMigrationSuccess);
  }

  private async normalizeParentByPage(page, user) {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const {
      path, grant, grantedUsers: grantedUserIds, grantedGroup: grantedGroupId,
    } = page;

    // check if any page exists at target path already
    const existingPage = await Page.findOne({ path, parent: { $ne: null } });
    if (existingPage != null && !existingPage.isEmpty) {
      throw Error('Page already exists. Please rename the page to continue.');
    }

    /*
     * UserGroup & Owner validation
     */
    if (grant !== Page.GRANT_RESTRICTED) {
      let isGrantNormalized = false;
      try {
        const shouldCheckDescendants = true;

        isGrantNormalized = await this.crowi.pageGrantService.isGrantNormalized(user, path, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);
      }
      catch (err) {
        logger.error(`Failed to validate grant of page at "${path}"`, err);
        throw err;
      }
      if (!isGrantNormalized) {
        throw Error('This page cannot be migrated since the selected grant or grantedGroup is not assignable to this page.');
      }
    }
    else {
      throw Error('Restricted pages can not be migrated');
    }

    let normalizedPage;

    // replace if empty page exists
    if (existingPage != null && existingPage.isEmpty) {
      // Inherit descendantCount from the empty page
      const updatedPage = await Page.findOneAndUpdate({ _id: page._id }, { descendantCount: existingPage.descendantCount }, { new: true });
      await Page.replaceTargetWithPage(existingPage, updatedPage, true);
      normalizedPage = await Page.findById(page._id);
    }
    else {
      const parent = await this.getParentAndFillAncestorsByUser(user, page.path);
      normalizedPage = await Page.findOneAndUpdate({ _id: page._id }, { parent: parent._id }, { new: true });
    }

    // Update descendantCount
    const inc = 1;
    await this.updateDescendantCountOfAncestors(normalizedPage.parent, inc, true);

    return normalizedPage;
  }

  async normalizeParentRecursivelyByPages(pages, user): Promise<void> {
    /*
     * Main Operation
     */
    const socket = this.crowi.socketIoService.getDefaultSocket();

    const pagesToNormalize = omitDuplicateAreaPageFromPages(pages);

    let normalizablePages;
    let nonNormalizablePages;
    try {
      [normalizablePages, nonNormalizablePages] = await this.crowi.pageGrantService.separateNormalizableAndNotNormalizablePages(user, pagesToNormalize);
    }
    catch (err) {
      socket.emit(SocketEventName.PageMigrationError);
      throw err;
    }

    if (normalizablePages.length === 0) {
      socket.emit(SocketEventName.PageMigrationError);
      return;
    }

    if (nonNormalizablePages.length !== 0) {
      const nonNormalizablePagePaths: string[] = nonNormalizablePages.map(p => p.path);
      socket.emit(SocketEventName.PageMigrationError, { paths: nonNormalizablePagePaths });
      logger.debug('Some pages could not be converted.', nonNormalizablePagePaths);
    }

    /*
     * Main Operation (s)
     */
    const errorPagePaths: string[] = [];
    for await (const page of normalizablePages) {
      const canOperate = await this.crowi.pageOperationService.canOperate(true, page.path, page.path);
      if (!canOperate) {
        errorPagePaths.push(page.path);
        throw Error(`Cannot operate normalizeParentRecursiively to path "${page.path}" right now.`);
      }

      const Page = mongoose.model('Page') as unknown as PageModel;
      const { PageQueryBuilder } = Page;
      const builder = new PageQueryBuilder(Page.findOne());
      builder.addConditionAsOnTree();
      builder.addConditionToListByPathsArray([page.path]);
      const existingPage = await builder.query.exec();

      if (existingPage?.parent != null) {
        errorPagePaths.push(page.path);
        throw Error('This page has already converted.');
      }

      let pageOp;
      try {
        pageOp = await PageOperation.create({
          actionType: PageActionType.NormalizeParent,
          actionStage: PageActionStage.Main,
          page,
          user,
          fromPath: page.path,
          toPath: page.path,
        });
      }
      catch (err) {
        errorPagePaths.push(page.path);
        logger.error('Failed to create PageOperation document.', err);
        throw err;
      }

      try {
        await this.normalizeParentRecursivelyMainOperation(page, user, pageOp._id);
      }
      catch (err) {
        errorPagePaths.push(page.path);
        logger.error('Failed to run normalizeParentRecursivelyMainOperation.', err);

        // cleanup
        await PageOperation.deleteOne({ _id: pageOp._id });

        throw err;
      }
    }
    if (errorPagePaths.length === 0) {
      socket.emit(SocketEventName.PageMigrationSuccess);
    }
    else {
      socket.emit(SocketEventName.PageMigrationError, { paths: errorPagePaths });
    }
  }

  async normalizeParentRecursivelyMainOperation(page, user, pageOpId: ObjectIdLike): Promise<number> {
    // Save prevDescendantCount for sub-operation
    const Page = mongoose.model('Page') as unknown as PageModel;
    const { PageQueryBuilder } = Page;
    const builder = new PageQueryBuilder(Page.findOne(), true);
    builder.addConditionAsOnTree();
    builder.addConditionToListByPathsArray([page.path]);
    const exPage = await builder.query.exec();
    const options = { prevDescendantCount: exPage?.descendantCount ?? 0 };

    let count: number;
    try {
      count = await this.normalizeParentRecursively([page.path], user);
    }
    catch (err) {
      logger.error('V5 initial miration failed.', err);
      // socket.emit('normalizeParentRecursivelyByPageIds', { error: err.message }); TODO: use socket to tell user

      throw err;
    }

    // Set to Sub
    const pageOp = await PageOperation.findByIdAndUpdatePageActionStage(pageOpId, PageActionStage.Sub);
    if (pageOp == null) {
      throw Error('PageOperation document not found');
    }

    await this.normalizeParentRecursivelySubOperation(page, user, pageOp._id, options);

    return count;
  }

  async normalizeParentRecursivelySubOperation(page, user, pageOpId: ObjectIdLike, options: {prevDescendantCount: number}): Promise<void> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    try {
      // update descendantCount of self and descendant pages first
      await this.updateDescendantCountOfSelfAndDescendants(page.path);

      // find pages again to get updated descendantCount
      // then calculate inc
      const pageAfterUpdatingDescendantCount = await Page.findByIdAndViewer(page._id, user);
      if (pageAfterUpdatingDescendantCount == null) {
        throw Error('Page not found after updating descendantCount');
      }

      const { prevDescendantCount } = options;
      const newDescendantCount = pageAfterUpdatingDescendantCount.descendantCount;
      let inc = newDescendantCount - prevDescendantCount;
      const isAlreadyConverted = page.parent != null;
      if (!isAlreadyConverted) {
        inc += 1;
      }
      await this.updateDescendantCountOfAncestors(page._id, inc, false);
    }
    catch (err) {
      logger.error('Failed to update descendantCount after normalizing parent:', err);
      throw Error(`Failed to update descendantCount after normalizing parent: ${err}`);
    }

    await PageOperation.findByIdAndDelete(pageOpId);
  }

  async _isPagePathIndexUnique() {
    const Page = this.crowi.model('Page');
    const now = (new Date()).toString();
    const path = `growi_check_is_path_index_unique_${now}`;

    let isUnique = false;

    try {
      await Page.insertMany([
        { path },
        { path },
      ]);
    }
    catch (err) {
      if (err?.code === 11000) { // Error code 11000 indicates the index is unique
        isUnique = true;
        logger.info('Page path index is unique.');
      }
      else {
        throw err;
      }
    }
    finally {
      await Page.deleteMany({ path: { $regex: new RegExp('growi_check_is_path_index_unique', 'g') } });
    }


    return isUnique;
  }

  async normalizeAllPublicPages() {
    let isUnique;
    try {
      isUnique = await this._isPagePathIndexUnique();
    }
    catch (err) {
      logger.error('Failed to check path index status', err);
      throw err;
    }

    // drop unique index first
    if (isUnique) {
      try {
        await this._v5NormalizeIndex();
      }
      catch (err) {
        logger.error('V5 index normalization failed.', err);
        throw err;
      }
    }

    // then migrate
    try {
      await this.normalizeParentRecursively(['/'], null, true);
    }
    catch (err) {
      logger.error('V5 initial miration failed.', err);

      throw err;
    }

    // update descendantCount of all public pages
    try {
      await this.updateDescendantCountOfSelfAndDescendants('/');
      logger.info('Successfully updated all descendantCount of public pages.');
    }
    catch (err) {
      logger.error('Failed updating descendantCount of public pages.', err);
      throw err;
    }

    await this._setIsV5CompatibleTrue();
  }

  private async _setIsV5CompatibleTrue() {
    try {
      await this.crowi.configManager.updateConfigsInTheSameNamespace('crowi', {
        'app:isV5Compatible': true,
      });
      logger.info('Successfully migrated all public pages.');
    }
    catch (err) {
      logger.warn('Failed to update app:isV5Compatible to true.');
      throw err;
    }
  }

  private async normalizeParentAndDescendantCountOfDescendants(path: string, user): Promise<void> {
    await this.normalizeParentRecursively([path], user);

    // update descendantCount of descendant pages
    await this.updateDescendantCountOfSelfAndDescendants(path);
  }

  /**
   * Normalize parent attribute by passing paths and user.
   * @param paths Pages under this paths value will be updated.
   * @param user To be used to filter pages to update. If null, only public pages will be updated.
   * @returns Promise<void>
   */
  async normalizeParentRecursively(paths: string[], user: any | null, shouldEmitProgress = false): Promise<number> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const ancestorPaths = paths.flatMap(p => collectAncestorPaths(p, []));
    // targets' descendants
    const pathAndRegExpsToNormalize: (RegExp | string)[] = paths
      .map(p => new RegExp(`^${escapeStringRegexp(addTrailingSlash(p))}`, 'i'));
    // include targets' path
    pathAndRegExpsToNormalize.push(...paths);

    // determine UserGroup condition
    let userGroups = null;
    if (user != null) {
      const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model
      userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
    }

    const grantFiltersByUser: { $or: any[] } = Page.generateGrantCondition(user, userGroups);

    return this._normalizeParentRecursively(pathAndRegExpsToNormalize, ancestorPaths, grantFiltersByUser, user, shouldEmitProgress);
  }

  private buildFilterForNormalizeParentRecursively(pathOrRegExps: (RegExp | string)[], publicPathsToNormalize: string[], grantFiltersByUser: { $or: any[] }) {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const andFilter: any = {
      $and: [
        {
          parent: null,
          status: Page.STATUS_PUBLISHED,
          path: { $ne: '/' },
        },
      ],
    };
    const orFilter: any = { $or: [] };
    // specified pathOrRegExps
    if (pathOrRegExps.length > 0) {
      orFilter.$or.push(
        {
          path: { $in: pathOrRegExps },
        },
      );
    }
    // not specified but ancestors of specified pathOrRegExps
    if (publicPathsToNormalize.length > 0) {
      orFilter.$or.push(
        {
          path: { $in: publicPathsToNormalize },
          grant: Page.GRANT_PUBLIC, // use only public pages to complete the tree
        },
      );
    }

    // Merge filters
    const mergedFilter = {
      $and: [
        { $and: [grantFiltersByUser, ...andFilter.$and] },
        { $or: orFilter.$or },
      ],
    };

    return mergedFilter;
  }

  private async _normalizeParentRecursively(
      pathOrRegExps: (RegExp | string)[],
      publicPathsToNormalize: string[],
      grantFiltersByUser: { $or: any[] },
      user,
      shouldEmitProgress = false,
      count = 0,
      skiped = 0,
      isFirst = true,
  ): Promise<number> {
    const BATCH_SIZE = 100;
    const PAGES_LIMIT = 1000;

    const socket = shouldEmitProgress ? this.crowi.socketIoService.getAdminSocket() : null;

    const Page = mongoose.model('Page') as unknown as PageModel;
    const { PageQueryBuilder } = Page;

    // Build filter
    const matchFilter = this.buildFilterForNormalizeParentRecursively(pathOrRegExps, publicPathsToNormalize, grantFiltersByUser);

    let baseAggregation = Page
      .aggregate([
        { $match: matchFilter },
        {
          $project: { // minimize data to fetch
            _id: 1,
            path: 1,
          },
        },
      ]);

    // Limit pages to get
    const total = await Page.countDocuments(matchFilter);
    if (isFirst) {
      socket?.emit(SocketEventName.PMStarted, { total });
    }
    if (total > PAGES_LIMIT) {
      baseAggregation = baseAggregation.limit(Math.floor(total * 0.3));
    }

    const pagesStream = await baseAggregation.cursor({ batchSize: BATCH_SIZE });
    const batchStream = createBatchStream(BATCH_SIZE);

    let shouldContinue = true;
    let nextCount = count;
    let nextSkiped = skiped;

    // eslint-disable-next-line max-len
    const buildPipelineToCreateEmptyPagesByUser = this.buildPipelineToCreateEmptyPagesByUser.bind(this);

    const migratePagesStream = new Writable({
      objectMode: true,
      async write(pages, encoding, callback) {
        const parentPaths = Array.from(new Set<string>(pages.map(p => pathlib.dirname(p.path))));

        // 1. Remove unnecessary empty pages & reset parent for pages which had had those empty pages
        const pageIdsToNotDelete = pages.map(p => p._id);
        const emptyPagePathsToDelete = pages.map(p => p.path);

        const builder1 = new PageQueryBuilder(Page.find({ isEmpty: true }, { _id: 1 }), true);
        builder1.addConditionToListByPathsArray(emptyPagePathsToDelete);
        builder1.addConditionToExcludeByPageIdsArray(pageIdsToNotDelete);

        const emptyPagesToDelete = await builder1.query.lean().exec();
        const resetParentOperations = emptyPagesToDelete.map((p) => {
          return {
            updateOne: {
              filter: {
                parent: p._id,
              },
              update: {
                parent: null,
              },
            },
          };
        });

        await Page.bulkWrite(resetParentOperations);
        await Page.removeEmptyPages(pageIdsToNotDelete, emptyPagePathsToDelete);

        // 2. Create lacking parents as empty pages
        const orFilters = [
          { path: '/' },
          { path: { $in: publicPathsToNormalize }, grant: Page.GRANT_PUBLIC, status: Page.STATUS_PUBLISHED },
          { path: { $in: publicPathsToNormalize }, parent: { $ne: null }, status: Page.STATUS_PUBLISHED },
          { path: { $nin: publicPathsToNormalize }, status: Page.STATUS_PUBLISHED },
        ];
        const filterForApplicableAncestors = { $or: orFilters };
        const aggregationPipeline = await buildPipelineToCreateEmptyPagesByUser(user, parentPaths, false, filterForApplicableAncestors);
        await Page.createEmptyPagesByPaths(parentPaths, aggregationPipeline);

        // 3. Find parents
        const addGrantCondition = (builder) => {
          builder.query = builder.query.and(grantFiltersByUser);

          return builder;
        };
        const builder2 = new PageQueryBuilder(Page.find(), true);
        addGrantCondition(builder2);
        const parents = await builder2
          .addConditionToListByPathsArray(parentPaths)
          .addConditionToFilterByApplicableAncestors(publicPathsToNormalize)
          .query
          .lean()
          .exec();

        // Normalize all siblings for each page
        const updateManyOperations = parents.map((parent) => {
          const parentId = parent._id;

          // Build filter
          const parentPathEscaped = escapeStringRegexp(parent.path === '/' ? '' : parent.path); // adjust the path for RegExp
          const filter: any = {
            $and: [
              {
                path: { $regex: new RegExp(`^${parentPathEscaped}(\\/[^/]+)\\/?$`, 'i') }, // see: regexr.com/6889f (e.g. /parent/any_child or /any_level1)
              },
              {
                path: { $in: pathOrRegExps.concat(publicPathsToNormalize) },
              },
              filterForApplicableAncestors,
              grantFiltersByUser,
            ],
          };

          return {
            updateMany: {
              filter,
              update: {
                parent: parentId,
              },
            },
          };
        });
        try {
          const res = await Page.bulkWrite(updateManyOperations);

          nextCount += res.result.nModified;
          nextSkiped += res.result.writeErrors.length;
          logger.info(`Page migration processing: (migratedPages=${res.result.nModified})`);

          socket?.emit(SocketEventName.PMMigrating, { count: nextCount });
          socket?.emit(SocketEventName.PMErrorCount, { skip: nextSkiped });

          // Throw if any error is found
          if (res.result.writeErrors.length > 0) {
            logger.error('Failed to migrate some pages', res.result.writeErrors);
            socket?.emit(SocketEventName.PMEnded, { isSucceeded: false });
            throw Error('Failed to migrate some pages');
          }

          // Finish migration if no modification occurred
          if (res.result.nModified === 0 && res.result.nMatched === 0) {
            shouldContinue = false;
            logger.error('Migration is unable to continue', 'parentPaths:', parentPaths, 'bulkWriteResult:', res);
            socket?.emit(SocketEventName.PMEnded, { isSucceeded: false });
          }
        }
        catch (err) {
          logger.error('Failed to update page.parent.', err);
          throw err;
        }

        callback();
      },
      final(callback) {
        callback();
      },
    });

    pagesStream
      .pipe(batchStream)
      .pipe(migratePagesStream);

    await streamToPromise(migratePagesStream);

    if (await Page.exists(matchFilter) && shouldContinue) {
      return this._normalizeParentRecursively(
        pathOrRegExps,
        publicPathsToNormalize,
        grantFiltersByUser,
        user,
        shouldEmitProgress,
        nextCount,
        nextSkiped,
        false,
      );
    }

    // End
    socket?.emit(SocketEventName.PMEnded, { isSucceeded: true });

    return nextCount;
  }

  private async _v5NormalizeIndex() {
    const collection = mongoose.connection.collection('pages');

    try {
      // drop pages.path_1 indexes
      await collection.dropIndex('path_1');
      logger.info('Succeeded to drop unique indexes from pages.path.');
    }
    catch (err) {
      logger.warn('Failed to drop unique indexes from pages.path.', err);
      throw err;
    }

    try {
      // create indexes without
      await collection.createIndex({ path: 1 }, { unique: false });
      logger.info('Succeeded to create non-unique indexes on pages.path.');
    }
    catch (err) {
      logger.warn('Failed to create non-unique indexes on pages.path.', err);
      throw err;
    }
  }

  async countPagesCanNormalizeParentByUser(user): Promise<number> {
    if (user == null) {
      throw Error('user is required');
    }

    const Page = mongoose.model('Page') as unknown as PageModel;
    const { PageQueryBuilder } = Page;

    const builder = new PageQueryBuilder(Page.count(), false);
    await builder.addConditionAsMigratablePages(user);

    const nMigratablePages = await builder.query.exec();

    return nMigratablePages;
  }

  /**
   * update descendantCount of the following pages
   * - page that has the same path as the provided path
   * - pages that are descendants of the above page
   */
  async updateDescendantCountOfSelfAndDescendants(path: string): Promise<void> {
    const BATCH_SIZE = 200;
    const Page = this.crowi.model('Page');
    const { PageQueryBuilder } = Page;

    const builder = new PageQueryBuilder(Page.find(), true);
    builder.addConditionAsOnTree();
    builder.addConditionToListWithDescendants(path);
    builder.addConditionToSortPagesByDescPath();

    const aggregatedPages = await builder.query.lean().cursor({ batchSize: BATCH_SIZE });
    await this.recountAndUpdateDescendantCountOfPages(aggregatedPages, BATCH_SIZE);
  }

  /**
   * update descendantCount of the pages sequentially from longer path to shorter path
   */
  async updateDescendantCountOfPagesWithPaths(paths: string[]): Promise<void> {
    const BATCH_SIZE = 200;
    const Page = this.crowi.model('Page');
    const { PageQueryBuilder } = Page;

    const builder = new PageQueryBuilder(Page.find(), true);
    builder.addConditionToListByPathsArray(paths); // find by paths
    builder.addConditionToSortPagesByDescPath(); // sort in DESC

    const aggregatedPages = await builder.query.lean().cursor({ batchSize: BATCH_SIZE });
    await this.recountAndUpdateDescendantCountOfPages(aggregatedPages, BATCH_SIZE);
  }

  /**
   * Recount descendantCount of pages one by one
   */
  async recountAndUpdateDescendantCountOfPages(pageCursor: QueryCursor<any>, batchSize:number): Promise<void> {
    const Page = this.crowi.model('Page');
    const recountWriteStream = new Writable({
      objectMode: true,
      async write(pageDocuments, encoding, callback) {
        for await (const document of pageDocuments) {
          const descendantCount = await Page.recountDescendantCount(document._id);
          await Page.findByIdAndUpdate(document._id, { descendantCount });
        }
        callback();
      },
      final(callback) {
        callback();
      },
    });
    pageCursor
      .pipe(createBatchStream(batchSize))
      .pipe(recountWriteStream);

    await streamToPromise(recountWriteStream);
  }

  // update descendantCount of all pages that are ancestors of a provided pageId by count
  async updateDescendantCountOfAncestors(pageId: ObjectIdLike, inc: number, shouldIncludeTarget: boolean): Promise<void> {
    const Page = this.crowi.model('Page');
    const ancestors = await Page.findAncestorsUsingParentRecursively(pageId, shouldIncludeTarget);
    const ancestorPageIds = ancestors.map(p => p._id);

    await Page.incrementDescendantCountOfPageIds(ancestorPageIds, inc);

    const updateDescCountData: UpdateDescCountRawData = Object.fromEntries(ancestors.map(p => [p._id.toString(), p.descendantCount + inc]));
    this.emitUpdateDescCount(updateDescCountData);
  }

  private emitUpdateDescCount(data: UpdateDescCountRawData): void {
    const socket = this.crowi.socketIoService.getDefaultSocket();

    socket.emit(SocketEventName.UpdateDescCount, data);
  }

  /**
   * Build the base aggregation pipeline for fillAncestors--- methods
   * @param onlyMigratedAsExistingPages Determine whether to include non-migrated pages as existing pages. If a page exists,
   * an empty page will not be created at that page's path.
   */
  private buildBasePipelineToCreateEmptyPages(paths: string[], onlyMigratedAsExistingPages = true, andFilter?): any[] {
    const aggregationPipeline: any[] = [];

    const Page = mongoose.model('Page') as unknown as PageModel;

    // -- Filter by paths
    aggregationPipeline.push({ $match: { path: { $in: paths } } });
    // -- Normalized condition
    if (onlyMigratedAsExistingPages) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { grant: Page.GRANT_PUBLIC },
            { parent: { $ne: null } },
            { path: '/' },
          ],
        },
      });
    }
    // -- Add custom pipeline
    if (andFilter != null) {
      aggregationPipeline.push({ $match: andFilter });
    }

    return aggregationPipeline;
  }

  private async buildPipelineToCreateEmptyPagesByUser(user, paths: string[], onlyMigratedAsExistingPages = true, andFilter?): Promise<any[]> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const pipeline = this.buildBasePipelineToCreateEmptyPages(paths, onlyMigratedAsExistingPages, andFilter);
    let userGroups = null;
    if (user != null) {
      const UserGroupRelation = mongoose.model('UserGroupRelation') as any;
      userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
    }
    const grantCondition = Page.generateGrantCondition(user, userGroups);
    pipeline.push({ $match: grantCondition });

    return pipeline;
  }

  private buildPipelineToCreateEmptyPagesBySystem(paths: string[]): any[] {
    return this.buildBasePipelineToCreateEmptyPages(paths);
  }

  private async connectPageTree(path: string): Promise<void> {
    const Page = mongoose.model('Page') as unknown as PageModel;
    const { PageQueryBuilder } = Page;

    const ancestorPaths = collectAncestorPaths(path);

    // Find ancestors
    const builder = new PageQueryBuilder(Page.find(), true);
    builder.addConditionToFilterByApplicableAncestors(ancestorPaths); // avoid including not normalized pages
    const ancestors = await builder
      .addConditionToListByPathsArray(ancestorPaths)
      .addConditionToSortPagesByDescPath()
      .query
      .exec();

    // Update parent attrs
    const ancestorsMap = new Map(); // Map<path, page>
    ancestors.forEach(page => !ancestorsMap.has(page.path) && ancestorsMap.set(page.path, page)); // the earlier element should be the true ancestor

    const nonRootAncestors = ancestors.filter(page => !isTopPage(page.path));
    const operations = nonRootAncestors.map((page) => {
      const parentPath = pathlib.dirname(page.path);
      return {
        updateOne: {
          filter: {
            _id: page._id,
          },
          update: {
            parent: ancestorsMap.get(parentPath)._id,
          },
        },
      };
    });
    await Page.bulkWrite(operations);
  }

  /**
   * Find parent or create parent if not exists.
   * It also updates parent of ancestors
   * @param path string
   * @returns Promise<PageDocument>
   */
  async getParentAndFillAncestorsByUser(user, path: string): Promise<PageDocument> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    // Find parent
    const parent = await Page.findParentByPath(path);
    if (parent != null) {
      return parent;
    }

    const ancestorPaths = collectAncestorPaths(path);

    // Fill ancestors
    const aggregationPipeline: any[] = await this.buildPipelineToCreateEmptyPagesByUser(user, ancestorPaths);

    await Page.createEmptyPagesByPaths(ancestorPaths, aggregationPipeline);

    // Connect ancestors
    await this.connectPageTree(path);

    // Return the created parent
    const createdParent = await Page.findParentByPath(path);
    if (createdParent == null) {
      throw Error('Failed to find the created parent by getParentAndFillAncestorsByUser');
    }
    return createdParent;
  }

  async getParentAndFillAncestorsBySystem(path: string): Promise<PageDocument> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    // Find parent
    const parent = await Page.findParentByPath(path);
    if (parent != null) {
      return parent;
    }

    // Fill ancestors
    const ancestorPaths = collectAncestorPaths(path);
    const aggregationPipeline: any[] = this.buildPipelineToCreateEmptyPagesBySystem(ancestorPaths);

    await Page.createEmptyPagesByPaths(ancestorPaths, aggregationPipeline);

    // Connect ancestors
    await this.connectPageTree(path);

    // Return the created parent
    const createdParent = await Page.findParentByPath(path);
    if (createdParent == null) {
      throw Error('Failed to find the created parent by getParentAndFillAncestorsByUser');
    }

    return createdParent;
  }

  // --------- Create ---------

  private async preparePageDocumentToCreate(path: string, shouldNew: boolean): Promise<PageDocument> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const emptyPage = await Page.findOne({ path, isEmpty: true });

    // Use empty page if exists, if not, create a new page
    let page;
    if (shouldNew) {
      page = new Page();
    }
    else if (emptyPage != null) {
      page = emptyPage;
      const descendantCount = await Page.recountDescendantCount(page._id);

      page.descendantCount = descendantCount;
      page.isEmpty = false;
    }
    else {
      page = new Page();
    }

    return page;
  }

  private setFieldExceptForGrantRevisionParent(
      pageDocument: PageDocument,
      path: string,
      user?,
  ): void {
    const Page = mongoose.model('Page') as unknown as PageModel;

    pageDocument.path = path;
    pageDocument.creator = user;
    pageDocument.lastUpdateUser = user;
    pageDocument.status = Page.STATUS_PUBLISHED;
  }

  private async canProcessCreate(
      path: string,
      grantData: {
        grant: number,
        grantedUserIds?: ObjectIdLike[],
        grantUserGroupId?: ObjectIdLike,
      },
      shouldValidateGrant: boolean,
      user?,
  ): Promise<boolean> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    // Operatability validation
    const canOperate = await this.crowi.pageOperationService.canOperate(false, null, path);
    if (!canOperate) {
      logger.error(`Cannot operate create to path "${path}" right now.`);
      return false;
    }

    // Existance validation
    const isExist = (await Page.count({ path, isEmpty: false })) > 0; // not validate empty page
    if (isExist) {
      logger.error('Cannot create new page to existed path');
      return false;
    }

    // UserGroup & Owner validation
    const { grant, grantedUserIds, grantUserGroupId } = grantData;
    if (shouldValidateGrant) {
      if (user == null) {
        throw Error('user is required to validate grant');
      }

      let isGrantNormalized = false;
      try {
        // It must check descendants as well if emptyTarget is not null
        const isEmptyPageAlreadyExist = await Page.count({ path, isEmpty: true }) > 0;
        const shouldCheckDescendants = isEmptyPageAlreadyExist;

        isGrantNormalized = await this.crowi.pageGrantService.isGrantNormalized(user, path, grant, grantedUserIds, grantUserGroupId, shouldCheckDescendants);
      }
      catch (err) {
        logger.error(`Failed to validate grant of page at "${path}" of grant ${grant}:`, err);
        throw err;
      }
      if (!isGrantNormalized) {
        throw Error('The selected grant or grantedGroup is not assignable to this page.');
      }
    }

    return true;
  }

  async create(path: string, body: string, user, options: PageCreateOptions = {}): Promise<PageDocument> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const expandContentWidth = this.crowi.configManager.getConfig('crowi', 'customize:isContainerFluid');

    // Switch method
    const isV5Compatible = this.crowi.configManager.getConfig('crowi', 'app:isV5Compatible');
    if (!isV5Compatible) {
      return Page.createV4(path, body, user, options);
    }

    // Values
    // eslint-disable-next-line no-param-reassign
    path = this.crowi.xss.process(path); // sanitize path
    const {
      format = 'markdown', grantUserGroupId,
    } = options;
    const grant = isTopPage(path) ? Page.GRANT_PUBLIC : options.grant;
    const grantData = {
      grant,
      grantedUserIds: grant === Page.GRANT_OWNER ? [user._id] : undefined,
      grantUserGroupId,
    };

    const isGrantRestricted = grant === Page.GRANT_RESTRICTED;

    // Validate
    const shouldValidateGrant = !isGrantRestricted;
    const canProcessCreate = await this.canProcessCreate(path, grantData, shouldValidateGrant, user);
    if (!canProcessCreate) {
      throw Error('Cannnot process create');
    }

    // Prepare a page document
    const shouldNew = isGrantRestricted;
    const page = await this.preparePageDocumentToCreate(path, shouldNew);

    // Set field
    this.setFieldExceptForGrantRevisionParent(page, path, user);

    // Apply scope
    page.applyScope(user, grant, grantUserGroupId);

    // Set parent
    if (isTopPage(path) || isGrantRestricted) { // set parent to null when GRANT_RESTRICTED
      page.parent = null;
    }
    else {
      const parent = await this.getParentAndFillAncestorsByUser(user, path);
      page.parent = parent._id;
    }
    if (expandContentWidth != null) {
      page.expandContentWidth = expandContentWidth;
    }
    // Save
    let savedPage = await page.save();

    // Create revision
    const Revision = mongoose.model('Revision') as any; // TODO: Typescriptize model
    const newRevision = Revision.prepareRevision(savedPage, body, null, user, { format });
    savedPage = await pushRevision(savedPage, newRevision, user);
    await savedPage.populateDataToShowRevision();

    // Update descendantCount
    await this.updateDescendantCountOfAncestors(savedPage._id, 1, false);

    // Emit create event
    this.pageEvent.emit('create', savedPage, user);

    // Delete PageRedirect if exists
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;
    try {
      await PageRedirect.deleteOne({ fromPath: path });
      logger.warn(`Deleted page redirect after creating a new page at path "${path}".`);
    }
    catch (err) {
      // no throw
      logger.error('Failed to delete PageRedirect');
    }

    return savedPage;
  }

  private async canProcessForceCreateBySystem(
      path: string,
      grantData: {
        grant: number,
        grantedUserIds?: ObjectIdLike[],
        grantUserGroupId?: ObjectIdLike,
      },
  ): Promise<boolean> {
    return this.canProcessCreate(path, grantData, false);
  }

  /**
   * @private
   * This method receives the same arguments as the PageService.create method does except for the added type '{ grantedUsers?: ObjectIdLike[] }'.
   * This additional value is used to determine the grantedUser of the page to be created by system.
   * This method must not run isGrantNormalized method to validate grant. **If necessary, run it before use this method.**
   * -- Reason 1: This is because it is not expected to use this method when the grant validation is required.
   * -- Reason 2: This is because it is not expected to use this method when the program cannot determine the operator.
   */
  private async forceCreateBySystem(path: string, body: string, options: PageCreateOptions & { grantedUsers?: ObjectIdLike[] }): Promise<PageDocument> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const isV5Compatible = this.crowi.configManager.getConfig('crowi', 'app:isV5Compatible');
    if (!isV5Compatible) {
      throw Error('This method is available only when v5 compatible');
    }

    // Values
    // eslint-disable-next-line no-param-reassign
    path = this.crowi.xss.process(path); // sanitize path

    const {
      format = 'markdown', grantUserGroupId, grantedUsers,
    } = options;
    const grant = isTopPage(path) ? Page.GRANT_PUBLIC : options.grant;

    const isGrantRestricted = grant === Page.GRANT_RESTRICTED;
    const isGrantOwner = grant === Page.GRANT_OWNER;

    const grantData = {
      grant,
      grantedUserIds: isGrantOwner ? grantedUsers : undefined,
      grantUserGroupId,
    };

    // Validate
    if (isGrantOwner && grantedUsers?.length !== 1) {
      throw Error('grantedUser must exist when grant is GRANT_OWNER');
    }
    const canProcessForceCreateBySystem = await this.canProcessForceCreateBySystem(path, grantData);
    if (!canProcessForceCreateBySystem) {
      throw Error('Cannnot process forceCreateBySystem');
    }

    // Prepare a page document
    const shouldNew = isGrantRestricted;
    const page = await this.preparePageDocumentToCreate(path, shouldNew);

    // Set field
    this.setFieldExceptForGrantRevisionParent(page, path);

    // Apply scope
    page.applyScope({ _id: grantedUsers?.[0] }, grant, grantUserGroupId);

    // Set parent
    if (isTopPage(path) || isGrantRestricted) { // set parent to null when GRANT_RESTRICTED
      page.parent = null;
    }
    else {
      const parent = await this.getParentAndFillAncestorsBySystem(path);
      page.parent = parent._id;
    }

    // Save
    let savedPage = await page.save();

    // Create revision
    const Revision = mongoose.model('Revision') as any; // TODO: Typescriptize model
    const dummyUser = { _id: new mongoose.Types.ObjectId() };
    const newRevision = Revision.prepareRevision(savedPage, body, null, dummyUser, { format });
    savedPage = await pushRevision(savedPage, newRevision, dummyUser);

    // Update descendantCount
    await this.updateDescendantCountOfAncestors(savedPage._id, 1, false);

    // Emit create event
    this.pageEvent.emit('create', savedPage, dummyUser);

    return savedPage;
  }

  /*
   * Find all children by parent's path or id. Using id should be prioritized
   */
  async findChildrenByParentPathOrIdAndViewer(parentPathOrId: string, user, userGroups = null): Promise<PageDocument[]> {
    const Page = mongoose.model('Page') as unknown as PageModel;
    let queryBuilder: PageQueryBuilder;
    if (hasSlash(parentPathOrId)) {
      const path = parentPathOrId;
      const regexp = generateChildrenRegExp(path);
      queryBuilder = new PageQueryBuilder(Page.find({ path: { $regex: regexp } }), true);
    }
    else {
      const parentId = parentPathOrId;
      // Use $eq for user-controlled sources. see: https://codeql.github.com/codeql-query-help/javascript/js-sql-injection/#recommendation
      queryBuilder = new PageQueryBuilder(Page.find({ parent: { $eq: parentId } } as any), true); // TODO: improve type
    }
    await queryBuilder.addViewerCondition(user, userGroups);

    const pages = await queryBuilder
      .addConditionToSortPagesByAscPath()
      .query
      .lean()
      .exec();

    await this.injectProcessDataIntoPagesByActionTypes(pages, [PageActionType.Rename]);

    return pages;
  }

  async findAncestorsChildrenByPathAndViewer(path: string, user, userGroups = null): Promise<Record<string, PageDocument[]>> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const ancestorPaths = isTopPage(path) ? ['/'] : collectAncestorPaths(path); // root path is necessary for rendering
    const regexps = ancestorPaths.map(path => new RegExp(generateChildrenRegExp(path))); // cannot use re2

    // get pages at once
    const queryBuilder = new PageQueryBuilder(Page.find({ path: { $in: regexps } }), true);
    await queryBuilder.addViewerCondition(user, userGroups);
    const pages = await queryBuilder
      .addConditionAsOnTree()
      .addConditionToMinimizeDataForRendering()
      .addConditionToSortPagesByAscPath()
      .query
      .lean()
      .exec();

    this.injectIsTargetIntoPages(pages, path);
    await this.injectProcessDataIntoPagesByActionTypes(pages, [PageActionType.Rename]);

    /*
     * If any non-migrated page is found during creating the pathToChildren map, it will stop incrementing at that moment
     */
    const pathToChildren: Record<string, PageDocument[]> = {};
    const sortedPaths = ancestorPaths.sort((a, b) => a.length - b.length); // sort paths by path.length
    sortedPaths.every((path) => {
      const children = pages.filter(page => pathlib.dirname(page.path) === path);
      if (children.length === 0) {
        return false; // break when children do not exist
      }
      pathToChildren[path] = children;
      return true;
    });

    return pathToChildren;
  }

  private injectIsTargetIntoPages(pages: (PageDocument & {isTarget?: boolean})[], path): void {
    pages.forEach((page) => {
      if (page.path === path) {
        page.isTarget = true;
      }
    });
  }

  /**
   * Inject processData into page docuements
   * The processData is a combination of actionType as a key and information on whether the action is processable as a value.
   */
  private async injectProcessDataIntoPagesByActionTypes(
      pages: (PageDocument & { processData?: IPageOperationProcessData })[],
      actionTypes: PageActionType[],
  ): Promise<void> {

    const pageOperations = await PageOperation.find({ actionType: { $in: actionTypes } });
    if (pageOperations == null || pageOperations.length === 0) {
      return;
    }

    const processInfo: IPageOperationProcessInfo = this.crowi.pageOperationService.generateProcessInfo(pageOperations);
    const operatingPageIds: string[] = Object.keys(processInfo);

    // inject processData into pages
    pages.forEach((page) => {
      const pageId = page._id.toString();
      if (operatingPageIds.includes(pageId)) {
        const processData: IPageOperationProcessData = processInfo[pageId];
        page.processData = processData;
      }
    });
  }

}

export default PageService;
