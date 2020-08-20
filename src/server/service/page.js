class PageService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  serializeToObj(page) {
    const { User } = this.crowi.models;

    const returnObj = page.toObject();

    // set the ObjectID to revisionHackmdSynced
    if (page.revisionHackmdSynced != null && page.revisionHackmdSynced._id != null) {
      returnObj.revisionHackmdSynced = page.revisionHackmdSynced._id;
    }

    if (page.lastUpdateUser != null && page.lastUpdateUser instanceof User) {
      returnObj.lastUpdateUser = page.lastUpdateUser.toObject();
    }
    if (page.creator != null && page.creator instanceof User) {
      returnObj.creator = page.creator.toObject();
    }

    return returnObj;
  }

  async deleteCompletely(pageId, pagePath) {
    // Delete Bookmarks, Attachments, Revisions, Pages and emit delete
    const Bookmark = this.crowi.model('Bookmark');
    const Comment = this.crowi.model('Comment');
    const PageTagRelation = this.crowi.model('PageTagRelation');
    const ShareLink = this.crowi.model('ShareLink');
    const Revision = this.crowi.model('Revision');

    return Promise.all([
      Bookmark.removeBookmarksByPageId(pageId),
      Comment.removeCommentsByPageId(pageId),
      PageTagRelation.remove({ relatedPage: pageId }),
      ShareLink.remove({ relatedPage: pageId }),
      Revision.removeRevisionsByPath(pagePath),
      this.removeAllAttachments(pageId),
      this.findByIdAndRemove(pageId),
      this.removeRedirectOriginPageByPath(pagePath),
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


}

module.exports = PageService;
