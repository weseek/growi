const mongoose = require('mongoose');
const escapeStringRegexp = require('escape-string-regexp');
const logger = require('@alias/logger')('growi:models:page');
const debug = require('debug')('growi:models:page');
const { Writable } = require('stream');
const { createBatchStream } = require('@server/util/batch-stream');
const { serializePageSecurely } = require('../models/serializers/page-serializer');

const STATUS_PUBLISHED = 'published';
const BULK_REINDEX_SIZE = 100;

class PageService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  async deleteCompletelyOperation(pageIds, pagePaths) {
    // Delete Bookmarks, Attachments, Revisions, Pages and emit delete
    const Bookmark = this.crowi.model('Bookmark');
    const Comment = this.crowi.model('Comment');
    const Page = this.crowi.model('Page');
    const PageTagRelation = this.crowi.model('PageTagRelation');
    const ShareLink = this.crowi.model('ShareLink');
    const Revision = this.crowi.model('Revision');

    return Promise.all([
      Bookmark.find({ page: { $in: pageIds } }).remove({}),
      Comment.find({ page: { $in: pageIds } }).remove({}),
      PageTagRelation.find({ relatedPage: { $in: pageIds } }).remove({}),
      ShareLink.find({ relatedPage: { $in: pageIds } }).remove({}),
      Revision.find({ path: { $in: pagePaths } }).remove({}),
      Page.find({ _id: { $in: pageIds } }).remove({}),
      Page.find({ path: { $in: pagePaths } }).remove({}),
      this.removeAllAttachments(pageIds),
    ]);
  }

  async removeAllAttachments(pageIds) {
    const Attachment = this.crowi.model('Attachment');
    const { attachmentService } = this.crowi;
    const attachments = await Attachment.find({ page: { $in: pageIds } });

    return attachmentService.removeAttachment(attachments);
  }

  async duplicate(page, newPagePath, user, isRecursively) {
    const Page = this.crowi.model('Page');
    const PageTagRelation = mongoose.model('PageTagRelation');
    // populate
    await page.populate({ path: 'revision', model: 'Revision', select: 'body' }).execPopulate();

    // create option
    const options = { page };
    options.grant = page.grant;
    options.grantUserGroupId = page.grantedGroup;
    options.grantedUsers = page.grantedUsers;

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
    }

    const result = serializePageSecurely(createdPage);
    result.tags = savedTags;

    return result;
  }

  /**
   * Receive the object with oldPageId and newPageId and duplicate the tags from oldPage to newPage
   * @param {Object} pageIdMapping e.g. key: oldPageId, value: newPageId
   */
  async duplicateTags(pageIdMapping) {
    const PageTagRelation = mongoose.model('PageTagRelation');

    // convert pageId from string to ObjectId
    const pageIds = Object.keys(pageIdMapping);
    const stage = { $or: pageIds.map((pageId) => { return { relatedPage: mongoose.Types.ObjectId(pageId) } }) };

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

    const newPageTagRelation = [];
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

  async duplicateDescendants(pages, user, oldPagePathPrefix, newPagePathPrefix, pathRevisionMapping) {
    const Page = this.crowi.model('Page');
    const Revision = this.crowi.model('Revision');

    // key: oldPageId, value: newPageId
    const pageIdMapping = {};
    const newPages = [];
    const newRevisions = [];

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
        redirectTo: null,
        revision: revisionId,
      });

      newRevisions.push({
        _id: revisionId, path: newPagePath, body: pathRevisionMapping[page.path].body, author: user._id, format: 'markdown',
      });

    });

    await Page.insertMany(newPages, { ordered: false });
    await Revision.insertMany(newRevisions, { ordered: false });
    await this.duplicateTags(pageIdMapping);
  }

  async duplicateDescendantsWithStream(page, newPagePath, user) {
    const Page = this.crowi.model('Page');
    const Revision = this.crowi.model('Revision');
    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(page.path)}`, 'i');
    const revisions = await Revision.find({ path: pathRegExp });

    const { PageQueryBuilder } = Page;

    const readStream = new PageQueryBuilder(Page.find())
      .addConditionToExcludeRedirect()
      .addConditionToListOnlyDescendants(page.path)
      .addConditionToFilteringByViewer(user)
      .query
      .lean()
      .cursor();

    // Mapping to set to the body of the new revision
    const pathRevisionMapping = {};
    revisions.forEach((revision) => {
      pathRevisionMapping[revision.path] = revision;
    });

    const duplicateDescendants = this.duplicateDescendants.bind(this);
    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        try {
          count += batch.length;
          await duplicateDescendants(batch, user, pathRegExp, newPagePathPrefix, pathRevisionMapping);
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

  // delete multiple pages
  async deleteMultipleCompletely(pages, user, options = {}) {
    this.validateCrowi();
    let pageEvent;
    // init event
    if (this.crowi != null) {
      pageEvent = this.crowi.event('page');
      pageEvent.on('create', pageEvent.onCreate);
      pageEvent.on('update', pageEvent.onUpdate);
    }

    const ids = pages.map(page => (page._id));
    const paths = pages.map(page => (page.path));
    const socketClientId = options.socketClientId || null;

    logger.debug('Deleting completely', paths);

    await this.deleteCompletelyOperation(ids, paths);

    if (socketClientId != null) {
      pageEvent.emit('deleteCompletely', pages, user, socketClientId); // update as renamed page
    }
    return;
  }

  async deleteCompletely(page, user, options = {}, isRecursively = false) {
    this.validateCrowi();
    let pageEvent;
    // init event
    if (this.crowi != null) {
      pageEvent = this.crowi.event('page');
      pageEvent.on('create', pageEvent.onCreate);
      pageEvent.on('update', pageEvent.onUpdate);
    }

    const ids = [page._id];
    const paths = [page.path];
    const socketClientId = options.socketClientId || null;

    logger.debug('Deleting completely', paths);

    await this.deleteCompletelyOperation(ids, paths);

    if (isRecursively) {
      this.deleteDescendantsWithStream(page, user, options);
    }

    if (socketClientId != null) {
      pageEvent.emit('delete', page, user, socketClientId); // update as renamed page
    }
    return;
  }

  /**
   * Create delete stream
   */
  async deleteDescendantsWithStream(targetPage, user, options = {}) {
    const Page = this.crowi.model('Page');
    const { PageQueryBuilder } = Page;

    const readStream = new PageQueryBuilder(Page.find())
      .addConditionToExcludeRedirect()
      .addConditionToListOnlyDescendants(targetPage.path)
      .addConditionToFilteringByViewer(user)
      .query
      .lean()
      .cursor();

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

  async revertDeletedPageRecursively(targetPage, user, options = {}) {
    const Page = this.crowi.model('Page');
    const newPath = Page.getRevertDeletedPageName(targetPage.path);
    const pathRegExp = new RegExp(`^${escapeStringRegexp(newPath)}`, 'i');
    const findOpts = { includeTrashed: true };
    const pages = await Page.findManageableListWithDescendants(targetPage, user, findOpts);

    // create bulk to delete redirectTo pages at high speed
    const pageCollection = mongoose.connection.collection('pages');
    const revisionCollection = mongoose.connection.collection('revisions');
    const unorderedBulkOp = pageCollection.initializeUnorderedBulkOp();
    const revisionUnorderedBulkOp = revisionCollection.initializeUnorderedBulkOp();

    const originPages = await Page.find({ path: { $in: pathRegExp } });

    const pathOriginMappings = {};
    pages.forEach((page) => {
      pathOriginMappings[page.path] = originPages;

      pathOriginMappings[page.path].forEach((pathOriginMapping) => {
        const originRegex = new RegExp(`^${escapeStringRegexp(page.path)}$`, 'i');
        pathOriginMappings[page.path] = pathOriginMapping.redirectTo.match(originRegex);

        if (pathOriginMapping[page.path] != null) {
          if (pathOriginMapping[page.path] !== page.path) {
            throw new Error('The new page of to revert is exists and the redirect path of the page is not the deleted page.');
          }
        }

        unorderedBulkOp.find({ redirectTo: pathOriginMapping.redirectTo }).remove();
        revisionUnorderedBulkOp.find({ path: pathOriginMapping.path }).remove();
      });


    });

    try {
      await unorderedBulkOp.execute();
      await revisionUnorderedBulkOp.execute();
    }
    catch (err) {
      if (err.code !== 11000) {
        throw new Error('Failed to revert pages: ', err);
      }
    }

    targetPage.status = STATUS_PUBLISHED;
    targetPage.lastUpdateUser = user;
    debug('Revert deleted the page', targetPage, newPath);
    const updatedPage = await Page.renameRecursively(targetPage, newPath, user, findOpts);
    return updatedPage;
  }

  async revertSingleDeletedPage(page, user, options = {}) {
    const Page = this.crowi.model('Page');
    const newPath = Page.getRevertDeletedPageName(page.path);
    const originPage = await Page.findByPath(newPath);
    if (originPage != null) {
      // When the page is deleted, it will always be created with "redirectTo" in the path of the original page.
      // So, it's ok to delete the page
      // However, If a page exists that is not "redirectTo", something is wrong. (Data correction is needed).
      if (originPage.redirectTo !== page.path) {
        throw new Error('The new page of to revert is exists and the redirect path of the page is not the deleted page.');
      }
      await this.deleteCompletely(originPage, options);
    }

    page.status = STATUS_PUBLISHED;
    page.lastUpdateUser = user;
    debug('Revert deleted the page', page, newPath);
    const updatedPage = await Page.rename(page, newPath, user, {});
    return updatedPage;
  }

  async handlePrivatePagesForDeletedGroup(deletedGroup, action, transferToUserGroupId) {
    const Page = this.crowi.model('Page');
    const pages = await Page.find({ grantedGroup: deletedGroup });

    switch (action) {
      case 'public':
        await Promise.all(pages.map((page) => {
          return Page.publicizePage(page);
        }));
        break;
      case 'delete':
        return this.deleteMultiplePagesCompletely(pages);
      case 'transfer':
        await Promise.all(pages.map((page) => {
          return Page.transferPageToGroup(page, transferToUserGroupId);
        }));
        break;
      default:
        throw new Error('Unknown action for private pages');
    }
  }

  validateCrowi() {
    if (this.crowi == null) {
      throw new Error('"crowi" is null. Init User model with "crowi" argument first.');
    }
  }

}

module.exports = PageService;
