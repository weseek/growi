import { pagePathUtils } from '@growi/core';
import mongoose, { QueryCursor } from 'mongoose';
import escapeStringRegexp from 'escape-string-regexp';
import streamToPromise from 'stream-to-promise';
import pathlib from 'path';
import { Readable, Writable } from 'stream';

import { serializePageSecurely } from '../models/serializers/page-serializer';
import { createBatchStream } from '~/server/util/batch-stream';
import loggerFactory from '~/utils/logger';
import {
  CreateMethod, generateGrantCondition, PageCreateOptions, PageModel,
} from '~/server/models/page';
import { stringifySnapshot } from '~/models/serializers/in-app-notification-snapshot/page';
import ActivityDefine from '../util/activityDefine';
import { IPage } from '~/interfaces/page';
import { PageRedirectModel } from '../models/page-redirect';
import { ObjectIdLike } from '../interfaces/mongoose-utils';

const debug = require('debug')('growi:services:page');

const logger = loggerFactory('growi:services:page');
const {
  isCreatablePage, isDeletablePage, isTrashPage, collectAncestorPaths, isTopPage,
} = pagePathUtils;

const BULK_REINDEX_SIZE = 100;

// TODO: improve type
class PageCursorsForDescendantsFactory {

  private user: any; // TODO: Typescriptize model

  private rootPage: any; // TODO: wait for mongoose update

  private shouldIncludeEmpty: boolean;

  private initialCursor: QueryCursor<any>; // TODO: wait for mongoose update

  private Page: PageModel;

  constructor(user: any, rootPage: any, shouldIncludeEmpty: boolean) {
    this.user = user;
    this.rootPage = rootPage;
    this.shouldIncludeEmpty = shouldIncludeEmpty;

    this.Page = mongoose.model('Page') as unknown as PageModel;
  }

  // prepare initial cursor
  private async init() {
    const initialCursor = await this.generateCursorToFindChildren(this.rootPage);
    this.initialCursor = initialCursor;
  }

  /**
   * Returns Iterable that yields only descendant pages unorderedly
   * @returns Promise<AsyncGenerator>
   */
  async generateIterable(): Promise<AsyncGenerator> {
    // initialize cursor
    await this.init();

    return this.generateOnlyDescendants(this.initialCursor);
  }

  /**
   * Returns Readable that produces only descendant pages unorderedly
   * @returns Promise<Readable>
   */
  async generateReadable(): Promise<Readable> {
    return Readable.from(await this.generateIterable());
  }

  /**
   * Generator that unorderedly yields descendant pages
   */
  private async* generateOnlyDescendants(cursor: QueryCursor<any>) {
    for await (const page of cursor) {
      const nextCursor = await this.generateCursorToFindChildren(page);
      yield* this.generateOnlyDescendants(nextCursor); // recursively yield

      yield page;
    }
  }

  private async generateCursorToFindChildren(page: any): Promise<QueryCursor<any>> {
    const { PageQueryBuilder } = this.Page;

    const builder = new PageQueryBuilder(this.Page.find(), this.shouldIncludeEmpty);
    builder.addConditionToFilteringByParentId(page._id);
    await this.Page.addConditionToFilteringByViewerToEdit(builder, this.user);

    const cursor = builder.query.lean().cursor({ batchSize: BULK_REINDEX_SIZE }) as QueryCursor<any>;

    return cursor;
  }

}

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

    // update
    this.pageEvent.on('update', async(page, user) => {

      this.pageEvent.onUpdate();

      try {
        await this.createAndSendNotifications(page, user, ActivityDefine.ACTION_PAGE_UPDATE);
      }
      catch (err) {
        logger.error(err);
      }
    });

    // rename
    this.pageEvent.on('rename', async(page, user) => {
      try {
        await this.createAndSendNotifications(page, user, ActivityDefine.ACTION_PAGE_RENAME);
      }
      catch (err) {
        logger.error(err);
      }
    });

    // delete
    this.pageEvent.on('delete', async(page, user) => {
      try {
        await this.createAndSendNotifications(page, user, ActivityDefine.ACTION_PAGE_DELETE);
      }
      catch (err) {
        logger.error(err);
      }
    });

    // delete completely
    this.pageEvent.on('deleteCompletely', async(page, user) => {
      try {
        await this.createAndSendNotifications(page, user, ActivityDefine.ACTION_PAGE_DELETE_COMPLETELY);
      }
      catch (err) {
        logger.error(err);
      }
    });

    // likes
    this.pageEvent.on('like', async(page, user) => {
      try {
        await this.createAndSendNotifications(page, user, ActivityDefine.ACTION_PAGE_LIKE);
      }
      catch (err) {
        logger.error(err);
      }
    });

    // bookmark
    this.pageEvent.on('bookmark', async(page, user) => {
      try {
        await this.createAndSendNotifications(page, user, ActivityDefine.ACTION_PAGE_BOOKMARK);
      }
      catch (err) {
        logger.error(err);
      }
    });
  }

  async findPageAndMetaDataByViewer({ pageId, path, user }) {

    const Page = this.crowi.model('Page');

    let page;
    if (pageId != null) { // prioritized
      page = await Page.findByIdAndViewer(pageId, user);
    }
    else {
      page = await Page.findByPathAndViewer(path, user);
    }

    const result: any = {};

    if (page == null) {
      const isExist = await Page.count({ $or: [{ _id: pageId }, { path }] }) > 0;
      result.isForbidden = isExist;
      result.isNotFound = !isExist;
      result.isCreatable = isCreatablePage(path);
      result.isDeletable = false;
      result.canDeleteCompletely = false;
      result.page = page;

      return result;
    }

    result.page = page;
    result.isForbidden = false;
    result.isNotFound = false;
    result.isCreatable = false;
    result.isDeletable = isDeletablePage(path);
    result.isDeleted = page.isDeleted();
    result.canDeleteCompletely = user != null && user.canDeleteCompletely(page.creator);

    return result;
  }

  private shouldUseV4Process(page): boolean {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const isPageMigrated = page.parent != null;
    const isV5Compatible = this.crowi.configManager.getConfig('crowi', 'app:isV5Compatible');
    const isRoot = isTopPage(page.path);
    const isPageRestricted = page.grant === Page.GRANT_RESTRICTED;
    const isTrashPage = page.status === Page.STATUS_DELETED;

    const shouldUseV4Process = !isRoot && !isPageRestricted && !isTrashPage && (!isV5Compatible || !isPageMigrated);

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
      .addConditionToExcludeRedirect()
      .addConditionToListOnlyDescendants(targetPagePath);

    await Page.addConditionToFilteringByViewerToEdit(builder, userToOperate);
    return builder
      .query
      .lean()
      .cursor({ batchSize: BULK_REINDEX_SIZE });
  }

  async renamePage(page, newPagePath, user, options) {
    const Page = this.crowi.model('Page');

    if (isTopPage(page.path)) {
      throw Error('It is forbidden to rename the top page');
    }

    // v4 compatible process
    const shouldUseV4Process = this.shouldUseV4Process(page);
    if (shouldUseV4Process) {
      return this.renamePageV4(page, newPagePath, user, options);
    }

    const updateMetadata = options.updateMetadata || false;
    // sanitize path
    newPagePath = this.crowi.xss.process(newPagePath); // eslint-disable-line no-param-reassign

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

    /*
     * UserGroup & Owner validation
     */
    if (grant !== Page.GRANT_RESTRICTED) {
      let isGrantNormalized = false;
      try {
        const shouldCheckDescendants = false;

        isGrantNormalized = await this.crowi.pageGrantService.isGrantNormalized(newPagePath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);
      }
      catch (err) {
        logger.error(`Failed to validate grant of page at "${newPagePath}" when renaming`, err);
        throw err;
      }
      if (!isGrantNormalized) {
        throw Error(`This page cannot be renamed to "${newPagePath}" since the selected grant or grantedGroup is not assignable to this page.`);
      }
    }

    // update descendants first
    await this.renameDescendantsWithStream(page, newPagePath, user, options, shouldUseV4Process);

    /*
     * update target
     */
    const update: Partial<IPage> = {};
    // find or create parent
    const newParent = await Page.getParentAndFillAncestors(newPagePath);
    // update Page
    update.path = newPagePath;
    update.parent = newParent._id;
    if (updateMetadata) {
      update.lastUpdateUser = user;
      update.updatedAt = new Date();
    }
    const renamedPage = await Page.findByIdAndUpdate(page._id, { $set: update }, { new: true });

    this.pageEvent.emit('rename', page, user);

    return renamedPage;
  }

  // !!renaming always include descendant pages!!
  private async renamePageV4(page, newPagePath, user, options) {
    const Page = this.crowi.model('Page');
    const Revision = this.crowi.model('Revision');
    const updateMetadata = options.updateMetadata || false;

    // sanitize path
    newPagePath = this.crowi.xss.process(newPagePath); // eslint-disable-line no-param-reassign

    // create descendants first
    await this.renameDescendantsWithStream(page, newPagePath, user, options);


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

    /*
     * TODO: https://redmine.weseek.co.jp/issues/86577
     * bulkWrite PageRedirectDocument if createRedirectPage is true
     */

    this.pageEvent.emit('rename', page, user);

    return renamedPage;
  }


  private async renameDescendants(pages, user, options, oldPagePathPrefix, newPagePathPrefix, shouldUseV4Process = true) {
    // v4 compatible process
    if (shouldUseV4Process) {
      return this.renameDescendantsV4(pages, user, options, oldPagePathPrefix, newPagePathPrefix);
    }

    const Page = mongoose.model('Page') as unknown as PageModel;
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;

    const { updateMetadata } = options;

    const updatePathOperations: any[] = [];
    const insertPageRedirectOperations: any[] = [];

    pages.forEach((page) => {
      const newPagePath = page.path.replace(oldPagePathPrefix, newPagePathPrefix);

      // increment updatePathOperations
      let update;
      if (updateMetadata && !page.isEmpty) {
        update = {
          $set: { path: newPagePath, lastUpdateUser: user._id, updatedAt: new Date() },
        };

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
      else {
        update = {
          $set: { path: newPagePath },
        };
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
      await PageRedirect.bulkWrite(insertPageRedirectOperations);
    }
    catch (err) {
      if (err.code !== 11000) {
        throw new Error(`Failed to rename pages: ${err}`);
      }
    }

    this.pageEvent.emit('updateMany', pages, user);
  }

  private async renameDescendantsV4(pages, user, options, oldPagePathPrefix, newPagePathPrefix) {
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;
    const pageCollection = mongoose.connection.collection('pages');
    const { updateMetadata } = options;

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
      insertPageRedirectOperations.push({
        insertOne: {
          document: {
            fromPath: page.path,
            toPath: newPagePath,
          },
        },
      });
    });

    try {
      await unorderedBulkOp.execute();
      await PageRedirect.bulkWrite(insertPageRedirectOperations);
    }
    catch (err) {
      if (err.code !== 11000) {
        throw new Error(`Failed to rename pages: ${err}`);
      }
    }

    this.pageEvent.emit('updateMany', pages, user);
  }

  private async renameDescendantsWithStream(targetPage, newPagePath, user, options = {}, shouldUseV4Process = true) {
    // v4 compatible process
    if (shouldUseV4Process) {
      return this.renameDescendantsWithStreamV4(targetPage, newPagePath, user, options);
    }

    const factory = new PageCursorsForDescendantsFactory(user, targetPage, true);
    const readStream = await factory.generateReadable();

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

    await streamToPromise(readStream);
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

    await streamToPromise(readStream);
  }

  /*
   * Duplicate
   */
  async duplicate(page, newPagePath, user, isRecursively) {
    const Page = mongoose.model('Page') as unknown as PageModel;
    const PageTagRelation = mongoose.model('PageTagRelation') as any; // TODO: Typescriptize model

    // v4 compatible process
    const shouldUseV4Process = this.shouldUseV4Process(page);
    if (shouldUseV4Process) {
      return this.duplicateV4(page, newPagePath, user, isRecursively);
    }

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

    /*
     * UserGroup & Owner validation
     */
    if (grant !== Page.GRANT_RESTRICTED) {
      let isGrantNormalized = false;
      try {
        const shouldCheckDescendants = false;

        isGrantNormalized = await this.crowi.pageGrantService.isGrantNormalized(newPagePath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);
      }
      catch (err) {
        logger.error(`Failed to validate grant of page at "${newPagePath}" when duplicating`, err);
        throw err;
      }
      if (!isGrantNormalized) {
        throw Error(`This page cannot be duplicated to "${newPagePath}" since the selected grant or grantedGroup is not assignable to this page.`);
      }
    }

    // populate
    await page.populate({ path: 'revision', model: 'Revision', select: 'body' });

    // create option
    const options: PageCreateOptions = {
      grant: page.grant,
      grantUserGroupId: page.grantedGroup,
    };

    newPagePath = this.crowi.xss.process(newPagePath); // eslint-disable-line no-param-reassign

    const createdPage = await (Page.create as CreateMethod)(
      newPagePath, page.revision.body, user, options,
    );

    if (isRecursively) {
      this.duplicateDescendantsWithStream(page, newPagePath, user, shouldUseV4Process);
    }

    // take over tags
    const originTags = await page.findRelatedTagsById();
    let savedTags = [];
    if (originTags.length !== 0) {
      await PageTagRelation.updatePageTags(createdPage._id, originTags);
      savedTags = await PageTagRelation.listTagNamesByPage(createdPage._id);
      this.tagEvent.emit('update', createdPage, savedTags);
    }

    const result = serializePageSecurely(createdPage);
    result.tags = savedTags;

    return result;
  }

  async duplicateV4(page, newPagePath, user, isRecursively) {
    const Page = this.crowi.model('Page');
    const PageTagRelation = mongoose.model('PageTagRelation') as any; // TODO: Typescriptize model
    // populate
    await page.populate({ path: 'revision', model: 'Revision', select: 'body' });

    // create option
    const options: any = { page };
    options.grant = page.grant;
    options.grantUserGroupId = page.grantedGroup;
    options.grantedUserIds = page.grantedUsers;

    newPagePath = this.crowi.xss.process(newPagePath); // eslint-disable-line no-param-reassign

    const createdPage = await Page.create(
      newPagePath, page.revision.body, user, options,
    );

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
      if (page.isEmpty) {
        newPage = {
          _id: newPageId,
          path: newPagePath,
          isEmpty: true,
        };
      }
      else {
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
      }

      newPages.push(newPage);

      newRevisions.push({
        _id: revisionId, path: newPagePath, body: pageIdRevisionMapping[page._id].body, author: user._id, format: 'markdown',
      });

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
        _id: revisionId, path: newPagePath, body: pageIdRevisionMapping[page._id].body, author: user._id, format: 'markdown',
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

    const iterableFactory = new PageCursorsForDescendantsFactory(user, page, true);
    const readStream = await iterableFactory.generateReadable();

    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(page.path)}`, 'i');

    const duplicateDescendants = this.duplicateDescendants.bind(this);
    const shouldNormalizeParent = this.shouldNormalizeParent.bind(this);
    const normalizeParentRecursively = this.normalizeParentRecursively.bind(this);
    const pageEvent = this.pageEvent;
    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        try {
          count += batch.length;
          await duplicateDescendants(batch, user, pathRegExp, newPagePathPrefix, shouldUseV4Process);
          logger.debug(`Adding pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('addAllPages error on add anyway: ', err);
        }

        callback();
      },
      async final(callback) {
        // normalize parent of descendant pages
        const shouldNormalize = shouldNormalizeParent(page);
        if (shouldNormalize) {
          try {
            const escapedPath = escapeStringRegexp(newPagePath);
            const regexps = [new RegExp(`^${escapedPath}`, 'i')];
            await normalizeParentRecursively(null, regexps);
            logger.info(`Successfully normalized duplicated descendant pages under "${newPagePath}"`);
          }
          catch (err) {
            logger.error('Failed to normalize descendants afrer duplicate:', err);
            throw err;
          }
        }

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

  }

  /*
   * Delete
   */
  async deletePage(page, user, options = {}, isRecursively = false) {
    const Page = mongoose.model('Page') as PageModel;
    const PageTagRelation = mongoose.model('PageTagRelation') as any; // TODO: Typescriptize model
    const Revision = mongoose.model('Revision') as any; // TODO: Typescriptize model
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;

    // v4 compatible process
    const shouldUseV4Process = this.shouldUseV4Process(page);
    if (shouldUseV4Process) {
      return this.deletePageV4(page, user, options, isRecursively);
    }

    const newPath = Page.getDeletedPageName(page.path);
    const isTrashed = isTrashPage(page.path);

    if (isTrashed) {
      throw new Error('This method does NOT support deleting trashed pages.');
    }

    if (!Page.isDeletableName(page.path)) {
      throw new Error('Page is not deletable.');
    }

    // replace with an empty page
    const shouldReplace = !isRecursively && await Page.exists({ parent: page._id });
    if (shouldReplace) {
      await Page.replaceTargetWithPage(page);
    }

    if (isRecursively) {
      this.deleteDescendantsWithStream(page, user, shouldUseV4Process); // use the same process in both version v4 and v5
    }
    else {
      // replace with an empty page
      const shouldReplace = await Page.exists({ parent: page._id });
      if (shouldReplace) {
        await Page.replaceTargetWithEmptyPage(page);
      }
    }

    let deletedPage;
    // update Revisions
    if (page.isEmpty) {
      await Page.remove({ _id: page._id });
    }
    else {
      await Revision.updateRevisionListByPageId(page._id, { pageId: page._id });
      deletedPage = await Page.findByIdAndUpdate(page._id, {
        $set: {
          path: newPath, status: Page.STATUS_DELETED, deleteUser: user._id, deletedAt: Date.now(), parent: null, // set parent as null
        },
      }, { new: true });
      await PageTagRelation.updateMany({ relatedPage: page._id }, { $set: { isPageTrashed: true } });

      await PageRedirect.create({ fromPath: page.path, toPath: newPath });

      this.pageEvent.emit('delete', page, user);
      this.pageEvent.emit('create', deletedPage, user);
    }

    return deletedPage;
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

    if (!Page.isDeletableName(page.path)) {
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

    await PageRedirect.create({ fromPath: page.path, toPath: newPath });

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
                path: newPath, status: Page.STATUS_DELETED, deleteUser: user._id, deletedAt: Date.now(), parent: null, // set parent as null
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
      await PageRedirect.bulkWrite(insertPageRedirectOperations);
    }
    catch (err) {
      if (err.code !== 11000) {
        throw new Error(`Failed to delete pages: ${err}`);
      }
    }
    finally {
      this.pageEvent.emit('syncDescendantsDelete', pages, user);
    }
  }

  /**
   * Create delete stream
   */
  private async deleteDescendantsWithStream(targetPage, user, shouldUseV4Process = true) {
    let readStream;
    if (shouldUseV4Process) {
      readStream = await this.generateReadStreamToOperateOnlyDescendants(targetPage.path, user);
    }
    else {
      const factory = new PageCursorsForDescendantsFactory(user, targetPage, true);
      readStream = await factory.generateReadable();
    }


    const deleteDescendants = this.deleteDescendants.bind(this);
    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
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
      Revision.deleteMany({ path: { $in: pagePaths } }),
      Page.deleteMany({ $or: [{ path: { $in: pagePaths } }, { _id: { $in: pageIds } }] }),
      PageRedirect.deleteMany({ $or: [{ toPath: { $in: pagePaths } }] }),
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
    const Page = mongoose.model('Page') as PageModel;

    if (isTopPage(page.path)) {
      throw Error('It is forbidden to delete the top page');
    }

    // v4 compatible process
    const shouldUseV4Process = this.shouldUseV4Process(page);
    if (shouldUseV4Process) {
      return this.deleteCompletelyV4(page, user, options, isRecursively, preventEmitting);
    }

    const ids = [page._id];
    const paths = [page.path];

    logger.debug('Deleting completely', paths);

    // replace with an empty page
    const shouldReplace = !isRecursively && !isTrashPage(page.path) && await Page.exists({ parent: page._id });
    if (shouldReplace) {
      await Page.replaceTargetWithPage(page);
    }

    await this.deleteCompletelyOperation(ids, paths);

    if (isRecursively) {
      this.deleteCompletelyDescendantsWithStream(page, user, options, shouldUseV4Process);
    }

    if (!page.isEmpty && !preventEmitting) {
      this.pageEvent.emit('deleteCompletely', page, user);
    }

    return;
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
  private async deleteCompletelyDescendantsWithStream(targetPage, user, options = {}, shouldUseV4Process = true) {
    let readStream;

    if (shouldUseV4Process) { // pages don't have parents
      readStream = await this.generateReadStreamToOperateOnlyDescendants(targetPage.path, user);
    }
    else {
      const factory = new PageCursorsForDescendantsFactory(user, targetPage, true);
      readStream = await factory.generateReadable();
    }

    const deleteMultipleCompletely = this.deleteMultipleCompletely.bind(this);
    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
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
  }

  // use the same process in both v4 and v5
  private async revertDeletedDescendants(pages, user) {
    const Page = this.crowi.model('Page');
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;

    const revertPageOperations: any[] = [];
    const fromPaths: string[] = [];

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

      fromPaths.push(page.path);
    });

    try {
      await Page.bulkWrite(revertPageOperations);
      await PageRedirect.deleteMany({ fromPath: { $in: fromPaths } });
    }
    catch (err) {
      if (err.code !== 11000) {
        throw new Error(`Failed to revert pages: ${err}`);
      }
    }
  }

  async revertDeletedPage(page, user, options = {}, isRecursively = false) {
    const Page = this.crowi.model('Page');
    const PageTagRelation = this.crowi.model('PageTagRelation');

    // v4 compatible process
    const shouldUseV4Process = this.shouldUseV4Process(page);
    if (shouldUseV4Process) {
      return this.revertDeletedPageV4(page, user, options, isRecursively);
    }

    const newPath = Page.getRevertDeletedPageName(page.path);
    const includeEmpty = true;
    const originPage = await Page.findByPath(newPath, includeEmpty);

    // throw if any page already exists
    if (originPage != null) {
      throw Error(`This page cannot be reverted since a page with path "${originPage.path}" already exists. Rename the existing pages first.`);
    }

    const parent = await Page.getParentAndFillAncestors(newPath);

    page.status = Page.STATUS_PUBLISHED;
    page.lastUpdateUser = user;
    const updatedPage = await Page.findByIdAndUpdate(page._id, {
      $set: {
        path: newPath, status: Page.STATUS_PUBLISHED, lastUpdateUser: user._id, deleteUser: null, deletedAt: null, parent: parent._id,
      },
    }, { new: true });
    await PageTagRelation.updateMany({ relatedPage: page._id }, { $set: { isPageTrashed: false } });

    if (isRecursively) {
      this.revertDeletedDescendantsWithStream(page, user, options, shouldUseV4Process);
    }

    return updatedPage;
  }

  private async revertDeletedPageV4(page, user, options = {}, isRecursively = false) {
    const Page = this.crowi.model('Page');
    const PageTagRelation = this.crowi.model('PageTagRelation');

    const newPath = Page.getRevertDeletedPageName(page.path);
    const originPage = await Page.findByPath(newPath);
    if (originPage != null) {
      throw Error(`This page cannot be reverted since a page with path "${originPage.path}" already exists.`);
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

    return updatedPage;
  }

  /**
   * Create revert stream
   */
  private async revertDeletedDescendantsWithStream(targetPage, user, options = {}, shouldUseV4Process = true) {
    if (shouldUseV4Process) {
      return this.revertDeletedDescendantsWithStreamV4(targetPage, user, options);
    }

    const readStream = await this.generateReadStreamToOperateOnlyDescendants(targetPage.path, user);

    const revertDeletedDescendants = this.revertDeletedDescendants.bind(this);
    const normalizeParentRecursively = this.normalizeParentRecursively.bind(this);
    const shouldNormalizeParent = this.shouldNormalizeParent.bind(this);
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
        const Page = mongoose.model('Page') as unknown as PageModel;
        // normalize parent of descendant pages
        const shouldNormalize = shouldNormalizeParent(targetPage);
        if (shouldNormalize) {
          try {
            const newPath = Page.getRevertDeletedPageName(targetPage.path);
            const escapedPath = escapeStringRegexp(newPath);
            const regexps = [new RegExp(`^${escapedPath}`, 'i')];
            await normalizeParentRecursively(null, regexps);
            logger.info(`Successfully normalized reverted descendant pages under "${newPath}"`);
          }
          catch (err) {
            logger.error('Failed to normalize descendants afrer revert:', err);
            throw err;
          }
        }
        logger.debug(`Reverting pages has completed: (totalCount=${count})`);

        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);
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

  async shortBodiesMapByPageIds(pageIds: string[] = [], user) {
    const Page = mongoose.model('Page');
    const MAX_LENGTH = 350;

    // aggregation options
    const viewerCondition = await generateGrantCondition(user, null);
    const filterByIds = {
      _id: { $in: pageIds.map(id => new mongoose.Types.ObjectId(id)) },
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
          viewerCondition,
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

  private async createAndSendNotifications(page, user, action) {
    const { activityService, inAppNotificationService } = this.crowi;

    const snapshot = stringifySnapshot(page);

    // Create activity
    const parameters = {
      user: user._id,
      targetModel: ActivityDefine.MODEL_PAGE,
      target: page,
      action,
    };
    const activity = await activityService.createByParameters(parameters);

    // Get user to be notified
    const targetUsers = await activity.getNotificationTargetUsers();

    // Create and send notifications
    await inAppNotificationService.upsertByActivity(targetUsers, activity, snapshot);
    await inAppNotificationService.emitSocketIo(targetUsers);
  }

  async normalizeParentByPageIds(pageIds: ObjectIdLike[]): Promise<void> {
    for await (const pageId of pageIds) {
      try {
        await this.normalizeParentByPageId(pageId);
      }
      catch (err) {
        // socket.emit('normalizeParentByPageIds', { error: err.message }); TODO: use socket to tell user
      }
    }
  }

  private async normalizeParentByPageId(pageId: ObjectIdLike) {
    const Page = mongoose.model('Page') as unknown as PageModel;
    const target = await Page.findById(pageId);
    if (target == null) {
      throw Error('target does not exist');
    }

    const {
      path, grant, grantedUsers: grantedUserIds, grantedGroup: grantedGroupId,
    } = target;

    /*
     * UserGroup & Owner validation
     */
    if (target.grant !== Page.GRANT_RESTRICTED) {
      let isGrantNormalized = false;
      try {
        const shouldCheckDescendants = true;

        isGrantNormalized = await this.crowi.pageGrantService.isGrantNormalized(path, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);
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

    // getParentAndFillAncestors
    const parent = await Page.getParentAndFillAncestors(target.path);

    return Page.updateOne({ _id: pageId }, { parent: parent._id });
  }

  async normalizeParentRecursivelyByPageIds(pageIds) {
    if (pageIds == null || pageIds.length === 0) {
      logger.error('pageIds is null or 0 length.');
      return;
    }

    const [normalizedIds, notNormalizedPaths] = await this.crowi.pageGrantService.separateNormalizedAndNonNormalizedPages(pageIds);

    if (normalizedIds.length === 0) {
      // socket.emit('normalizeParentRecursivelyByPageIds', { error: err.message }); TODO: use socket to tell user
      return;
    }

    if (notNormalizedPaths.length !== 0) {
      // TODO: iterate notNormalizedPaths and send socket error to client so that the user can know which path failed to migrate
      // socket.emit('normalizeParentRecursivelyByPageIds', { error: err.message }); TODO: use socket to tell user
    }

    // generate regexps
    const regexps = await this._generateRegExpsByPageIds(normalizedIds);

    // migrate recursively
    try {
      await this.normalizeParentRecursively(null, regexps);
    }
    catch (err) {
      logger.error('V5 initial miration failed.', err);
      // socket.emit('normalizeParentRecursivelyByPageIds', { error: err.message }); TODO: use socket to tell user

      throw err;
    }
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

  // TODO: use socket to send status to the client
  async v5InitialMigration(grant) {
    // const socket = this.crowi.socketIoService.getAdminSocket();

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
        // socket.emit('v5IndexNormalizationFailed', { error: err.message });
        throw err;
      }
    }

    // then migrate
    try {
      await this.normalizeParentRecursively(grant, null, true);
    }
    catch (err) {
      logger.error('V5 initial miration failed.', err);
      // socket.emit('v5InitialMirationFailed', { error: err.message });

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

  /*
   * returns an array of js RegExp instance instead of RE2 instance for mongo filter
   */
  private async _generateRegExpsByPageIds(pageIds) {
    const Page = mongoose.model('Page') as unknown as PageModel;

    let result;
    try {
      result = await Page.findListByPageIds(pageIds, null, false);
    }
    catch (err) {
      logger.error('Failed to find pages by ids', err);
      throw err;
    }

    const { pages } = result;
    const regexps = pages.map(page => new RegExp(`^${escapeStringRegexp(page.path)}`));

    return regexps;
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

  // TODO: use websocket to show progress
  private async normalizeParentRecursively(grant, regexps, publicOnly = false): Promise<void> {
    const BATCH_SIZE = 100;
    const PAGES_LIMIT = 1000;
    const Page = mongoose.model('Page') as unknown as PageModel;
    const { PageQueryBuilder } = Page;

    // GRANT_RESTRICTED and GRANT_SPECIFIED will never have parent
    const grantFilter: any = {
      $and: [
        { grant: { $ne: Page.GRANT_RESTRICTED } },
        { grant: { $ne: Page.GRANT_SPECIFIED } },
      ],
    };

    if (grant != null) { // add grant condition if not null
      grantFilter.$and = [...grantFilter.$and, { grant }];
    }

    // generate filter
    let filter: any = {
      parent: null,
      path: { $ne: '/' },
      status: Page.STATUS_PUBLISHED,
    };
    if (regexps != null && regexps.length !== 0) {
      filter = {
        ...filter,
        path: {
          $in: regexps,
        },
      };
    }

    const total = await Page.countDocuments(filter);

    let baseAggregation = Page
      .aggregate([
        {
          $match: grantFilter,
        },
        {
          $match: filter,
        },
        {
          $project: { // minimize data to fetch
            _id: 1,
            path: 1,
          },
        },
      ]);

    // limit pages to get
    if (total > PAGES_LIMIT) {
      baseAggregation = baseAggregation.limit(Math.floor(total * 0.3));
    }

    const pagesStream = await baseAggregation.cursor({ batchSize: BATCH_SIZE });

    // use batch stream
    const batchStream = createBatchStream(BATCH_SIZE);

    let countPages = 0;
    let shouldContinue = true;

    // migrate all siblings for each page
    const migratePagesStream = new Writable({
      objectMode: true,
      async write(pages, encoding, callback) {
        // make list to create empty pages
        const parentPathsSet = new Set<string>(pages.map(page => pathlib.dirname(page.path)));
        const parentPaths = Array.from(parentPathsSet);

        // fill parents with empty pages
        await Page.createEmptyPagesByPaths(parentPaths, publicOnly);

        // find parents again
        const builder = new PageQueryBuilder(Page.find({}, { _id: 1, path: 1 }), true);
        const parents = await builder
          .addConditionToListByPathsArray(parentPaths)
          .query
          .lean()
          .exec();

        // bulkWrite to update parent
        const updateManyOperations = parents.map((parent) => {
          const parentId = parent._id;

          // modify to adjust for RegExp
          let parentPath = parent.path === '/' ? '' : parent.path;
          parentPath = escapeStringRegexp(parentPath);

          const filter: any = {
            // regexr.com/6889f
            // ex. /parent/any_child OR /any_level1
            path: { $regex: new RegExp(`^${parentPath}(\\/[^/]+)\\/?$`, 'i') },
          };
          if (grant != null) {
            filter.grant = grant;
          }

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
          countPages += res.result.nModified;
          logger.info(`Page migration processing: (count=${countPages})`);

          // throw
          if (res.result.writeErrors.length > 0) {
            logger.error('Failed to migrate some pages', res.result.writeErrors);
            throw Error('Failed to migrate some pages');
          }

          // finish migration
          if (res.result.nModified === 0 && res.result.nMatched === 0) {
            shouldContinue = false;
            logger.error('Migration is unable to continue', 'parentPaths:', parentPaths, 'bulkWriteResult:', res);
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

    if (await Page.exists(filter) && shouldContinue) {
      return this.normalizeParentRecursively(grant, regexps, publicOnly);
    }

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

  async v5MigratablePrivatePagesCount(user) {
    if (user == null) {
      throw Error('user is required');
    }
    const Page = this.crowi.model('Page');
    return Page.count({ parent: null, creator: user, grant: { $ne: Page.GRANT_PUBLIC } });
  }

  /**
   * update descendantCount of the following pages
   * - page that has the same path as the provided path
   * - pages that are descendants of the above page
   */
  async updateDescendantCountOfSelfAndDescendants(path = '/') {
    const BATCH_SIZE = 200;
    const Page = this.crowi.model('Page');

    const aggregateCondition = Page.getAggrConditionForPageWithProvidedPathAndDescendants(path);
    const aggregatedPages = await Page.aggregate(aggregateCondition).cursor({ batchSize: BATCH_SIZE });

    const recountWriteStream = new Writable({
      objectMode: true,
      async write(pageDocuments, encoding, callback) {
        for (const document of pageDocuments) {
          // eslint-disable-next-line no-await-in-loop
          await Page.recountDescendantCountOfSelfAndDescendants(document._id);
        }
        callback();
      },
      final(callback) {
        callback();
      },
    });
    aggregatedPages
      .pipe(createBatchStream(BATCH_SIZE))
      .pipe(recountWriteStream);

    await streamToPromise(recountWriteStream);
  }

  // update descendantCount of all pages that are ancestors of a provided path by count
  async updateDescendantCountOfAncestors(path = '/', count = 0) {
    const Page = this.crowi.model('Page');
    const ancestors = collectAncestorPaths(path);
    await Page.incrementDescendantCountOfPaths(ancestors, count);
  }

}

export default PageService;
