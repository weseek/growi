const mongoose = require('mongoose');
const escapeStringRegexp = require('escape-string-regexp');
const { serializePageSecurely } = require('../models/serializers/page-serializer');

class PageService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  async deleteCompletely(pageId, pagePath) {
    // Delete Bookmarks, Attachments, Revisions, Pages and emit delete
    const Bookmark = this.crowi.model('Bookmark');
    const Comment = this.crowi.model('Comment');
    const Page = this.crowi.model('Page');
    const PageTagRelation = this.crowi.model('PageTagRelation');
    const ShareLink = this.crowi.model('ShareLink');
    const Revision = this.crowi.model('Revision');

    return Promise.all([
      Bookmark.removeBookmarksByPageId(pageId),
      Comment.removeCommentsByPageId(pageId),
      PageTagRelation.remove({ relatedPage: pageId }),
      ShareLink.remove({ relatedPage: pageId }),
      Revision.removeRevisionsByPath(pagePath),
      Page.findByIdAndRemove(pageId),
      Page.removeRedirectOriginPageByPath(pagePath),
      this.removeAllAttachments(pageId),
    ]);
  }

  async removeAllAttachments(pageId) {
    const Attachment = this.crowi.model('Attachment');
    const { attachmentService } = this.crowi;

    const attachments = await Attachment.find({ page: pageId });

    const promises = attachments.map(async(attachment) => {
      return attachmentService.removeAttachment(attachment._id);
    });

    return Promise.all(promises);
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
    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(page.path)}`, 'i');

    const pages = await Page.findManageableListWithDescendants(page, user);

    const promise = pages.map(async(page) => {
      const newPagePath = page.path.replace(pathRegExp, newPagePathPrefix);
      return this.duplicate(page, newPagePath, user);
    });

    const newPath = page.path.replace(pathRegExp, newPagePathPrefix);

    await Promise.allSettled(promise);

    const newParentpage = await Page.findByPath(newPath);

    // TODO GW-4634 use stream
    return newParentpage;
  }

  /**
   * Delete Bookmarks, Attachments, Revisions, Pages and emit delete
   */
  // TODO: transplant to service/page.js because page deletion affects various models data
  async completelyDeletePageRecursively(targetPage, user, options = {}) {
    const findOpts = { includeTrashed: true };
    const Page = this.crowi.model('Page');

    // find manageable descendants (this array does not include GRANT_RESTRICTED)
    const pages = await Page.findManageableListWithDescendants(targetPage, user, findOpts);

    await Promise.all(pages.map((page) => {
      return Page.completelyDeletePage(page, user, options);
    }));
  }


}

module.exports = PageService;
