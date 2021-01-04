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
    const Revision = this.crowi.model('Revision');
    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(page.path)}`, 'i');
    const pages = await Page.findManageableListWithDescendants(page, user);

    const newPages = [];
    const newRevisions = [];

    await Promise.all(pages.map(async(page) => {
      const newPagePath = page.path.replace(pathRegExp, newPagePathPrefix);
      await page.populate({ path: 'revision', model: 'Revision', select: 'body' }).execPopulate();
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
        _id: revisionId, path: newPagePath, body: page.revision.body, author: user._id, format: 'markdown',
      });

    }));

    await Page.insertMany(newPages, { ordered: false });
    await Revision.insertMany(newRevisions, { ordered: false });

    const newPath = page.path.replace(pathRegExp, newPagePathPrefix);
    const newParentpage = await Page.findByPath(newPath);

    // TODO GW-4634 use stream
    return newParentpage;
  }


}

module.exports = PageService;
