const mongoose = require('mongoose');
const escapeStringRegexp = require('escape-string-regexp');
const logger = require('@alias/logger')('growi:models:page');
const debug = require('debug')('growi:models:page');
const { serializePageSecurely } = require('../models/serializers/page-serializer');

const STATUS_PUBLISHED = 'published';

class PageService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  async deleteCompletely(pageIds, pagePaths) {
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

  async duplicate(page, newPagePath, user) {
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

  async duplicateRecursively(page, newPagePath, user) {

    const Page = this.crowi.model('Page');
    const Revision = this.crowi.model('Revision');
    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(page.path)}`, 'i');
    const pages = await Page.findManageableListWithDescendants(page, user);
    const revisions = await Revision.find({ path: pathRegExp });

    // Mapping to set to the body of the new revision
    const pathRevisionMapping = {};
    revisions.forEach((revision) => {
      pathRevisionMapping[revision.path] = revision;
    });

    const newPages = [];
    const newRevisions = [];

    pages.forEach((page) => {
      const newPagePath = page.path.replace(pathRegExp, newPagePathPrefix);
      const revisionId = new mongoose.Types.ObjectId();

      newPages.push({
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

    const newPath = page.path.replace(pathRegExp, newPagePathPrefix);
    const newParentpage = await Page.findByPath(newPath);

    // TODO GW-4634 use stream
    return newParentpage;
  }

  // delete multiple pages
  async completelyDeletePages(pagesData, user, options = {}) {
    this.validateCrowi();
    let pageEvent;
    // init event
    if (this.crowi != null) {
      pageEvent = this.crowi.event('page');
      pageEvent.on('create', pageEvent.onCreate);
      pageEvent.on('update', pageEvent.onUpdate);
    }

    const ids = pagesData.map(page => (page._id));
    const paths = pagesData.map(page => (page.path));
    const socketClientId = options.socketClientId || null;

    logger.debug('Deleting completely', paths);

    await this.deleteCompletely(ids, paths);

    if (socketClientId != null) {
      pageEvent.emit('deleteCompletely', pagesData, user, socketClientId); // update as renamed page
    }
    return;
  }

  // delete single page completely
  async completelyDeleteSinglePage(pageData, user, options = {}) {
    this.validateCrowi();
    let pageEvent;
    // init event
    if (this.crowi != null) {
      pageEvent = this.crowi.event('page');
      pageEvent.on('create', pageEvent.onCreate);
      pageEvent.on('update', pageEvent.onUpdate);
    }

    const ids = [pageData._id];
    const paths = [pageData.path];
    const socketClientId = options.socketClientId || null;

    logger.debug('Deleting completely', paths);

    await this.deleteCompletely(ids, paths);

    if (socketClientId != null) {
      pageEvent.emit('delete', pageData, user, socketClientId); // update as renamed page
    }
    return;
  }

  /**
   * Delete Bookmarks, Attachments, Revisions, Pages and emit delete
   */
  async completelyDeletePageRecursively(targetPage, user, options = {}) {
    const findOpts = { includeTrashed: true };
    const Page = this.crowi.model('Page');

    // find manageable descendants (this array does not include GRANT_RESTRICTED)
    const pages = await Page.findManageableListWithDescendants(targetPage, user, findOpts);

    // TODO streaming bellow action
    return this.completelyDeletePages(pages, user, options);
  }

  async revertDeletedPageRecursively(targetPage, user, options = {}) {
    const Page = this.crowi.model('Page');
    const newPath = Page.getRevertDeletedPageName(targetPage.path);
    const pathRegExp = new RegExp(`^${escapeStringRegexp(newPath)}`, 'i');
    const findOpts = { includeTrashed: true };
    const pages = await Page.findManageableListWithDescendants(targetPage, user, findOpts);
    const originPages = await Page.find({ path: pathRegExp }).sort({ _id: 1 });

    // create bulk to delete redirectTo pages at high speed
    const pageCollection = mongoose.connection.collection('pages');
    const revisionCollection = mongoose.connection.collection('revisions');
    const unorderedBulkOp = pageCollection.initializeUnorderedBulkOp();
    const revisionUnorderedBulkOp = revisionCollection.initializeUnorderedBulkOp();

    for (let i = 0; i < pages.length; i++) {

      if (originPages[i] != null) {
        if (originPages[i].redirectTo !== pages[i].path) {
          throw new Error('The new page of to revert is exists and the redirect path of the page is not the deleted page.');
        }
      }
      unorderedBulkOp.find({ _id: originPages[i]._id }).remove();
      revisionUnorderedBulkOp.find({ path: originPages[i].path }).remove();
    }

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
      await this.completelyDeleteSinglePage(originPage, options);
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
        return this.completelyDeletePages(pages);
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
