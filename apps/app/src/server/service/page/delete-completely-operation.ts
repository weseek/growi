import mongoose from 'mongoose';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

import { Attachment } from '../../models';
import { PageRedirectModel } from '../../models/page-redirect';
import ShareLink from '../../models/share-link';
import { removeAllAttachments } from '../attachment/remove-all-attachments';

export const deleteCompletelyOperation = async(pageIds: ObjectIdLike[], pagePaths: string[]): Promise<any[]> => {
  // Delete Bookmarks, Attachments, Revisions, Pages and emit delete
  const Bookmark = mongoose.model('Bookmark');
  const Comment = mongoose.model('Comment');
  const Page = mongoose.model('Page');
  const PageTagRelation = mongoose.model('PageTagRelation');
  const Revision = mongoose.model('Revision');
  const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;

  const attachments = await Attachment.find({ page: { $in: pageIds } });

  return Promise.all([
    Bookmark.deleteMany({ page: { $in: pageIds } }),
    Comment.deleteMany({ page: { $in: pageIds } }),
    PageTagRelation.deleteMany({ relatedPage: { $in: pageIds } }),
    ShareLink.deleteMany({ relatedPage: { $in: pageIds } }),
    Revision.deleteMany({ pageId: { $in: pageIds } }),
    Page.deleteMany({ _id: { $in: pageIds } }),
    PageRedirect.deleteMany({ $or: [{ fromPath: { $in: pagePaths } }, { toPath: { $in: pagePaths } }] }),
    removeAllAttachments(attachments),
  ]);
};
