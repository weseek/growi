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


}

module.exports = PageService;
