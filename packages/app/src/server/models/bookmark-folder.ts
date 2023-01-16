import { isValidObjectId } from '@growi/core/src/utils/objectid-utils';
import monggoose, {
  Types, Document, Model, Schema,
} from 'mongoose';


import { IBookmarkFolder, BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { IPageHasId } from '~/interfaces/page';

import loggerFactory from '../../utils/logger';
import { getOrCreateModel } from '../util/mongoose-utils';

import bookmark from './bookmark';
import { InvalidParentBookmarkFolderError } from './errors';


const logger = loggerFactory('growi:models:bookmark-folder');
const Bookmark = monggoose.model('Bookmark');


export interface BookmarkFolderDocument extends Document {
  _id: Types.ObjectId
  name: string
  owner: Types.ObjectId
  parent?: this[]
  bookmarks?: Types.ObjectId[]
}

export interface BookmarkFolderModel extends Model<BookmarkFolderDocument>{
  createByParameters(params: IBookmarkFolder): Promise<BookmarkFolderDocument>
  findFolderAndChildren(user: Types.ObjectId | string, parentId?: Types.ObjectId | string): Promise<BookmarkFolderItems[] | null>
  findChildFolderById(parentBookmarkFolder: Types.ObjectId | string): Promise<BookmarkFolderDocument[]>
  deleteFolderAndChildren(bookmarkFolderId: Types.ObjectId | string): Promise<{deletedCount: number}>
  updateBookmarkFolder(bookmarkFolderId: string, name: string, parent: string): Promise<BookmarkFolderDocument>
  insertOrUpdateBookmarkedPage(pageId: IPageHasId, userId: Types.ObjectId | string, folderId: string): Promise<BookmarkFolderDocument>
}

const bookmarkFolderSchema = new Schema<BookmarkFolderDocument, BookmarkFolderModel>({
  name: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  parent: { type: Schema.Types.ObjectId, ref: 'BookmarkFolder', required: false },
  bookmarks: {
    type: [{
      type: Schema.Types.ObjectId, ref: 'Bookmark', required: false,
    }],
    required: false,
    default: [],
  },
}, {
  toObject: { virtuals: true },
});

bookmarkFolderSchema.virtual('children', {
  ref: 'BookmarkFolder',
  localField: '_id',
  foreignField: 'parent',
});

bookmarkFolderSchema.statics.createByParameters = async function(params: IBookmarkFolder): Promise<BookmarkFolderDocument> {
  const { name, owner, parent } = params;
  let bookmarkFolder: BookmarkFolderDocument;

  if (parent == null) {
    bookmarkFolder = await this.create({ name, owner });
  }
  else {
    // Check if parent folder id is valid and parent folder exists
    const isParentFolderIdValid = isValidObjectId(parent as string);

    if (!isParentFolderIdValid) {
      throw new InvalidParentBookmarkFolderError('Parent folder id is invalid');
    }
    const parentFolder = await this.findById(parent);
    if (parentFolder == null) {
      throw new InvalidParentBookmarkFolderError('Parent folder not found');
    }
    bookmarkFolder = await this.create({ name, owner, parent:  parentFolder._id });
  }

  return bookmarkFolder;
};

bookmarkFolderSchema.statics.findFolderAndChildren = async function(
    userId: Types.ObjectId | string,
    parentId?: Types.ObjectId | string,
): Promise<BookmarkFolderItems[]> {

  let parentFolder: BookmarkFolderDocument | null;
  let query = {};
  // Load child bookmark folders
  if (parentId != null) {
    parentFolder = await this.findById(parentId);
    if (parentFolder != null) {
      query = { owner: userId, parent: parentFolder };
    }
    else {
      throw new InvalidParentBookmarkFolderError('Parent folder not found');
    }
  }
  // Load initial / root bookmark folders
  else {
    query = { owner: userId, parent: null };
  }
  const bookmarkFolders: BookmarkFolderItems[] = await this.find(query)
    .populate({ path: 'children' })
    .populate({
      path: 'bookmarks',
      model: 'Bookmark',
      populate: {
        path: 'page',
        model: 'Page',
      },
    });
  return bookmarkFolders;
};

bookmarkFolderSchema.statics.findChildFolderById = async function(parentFolderId: Types.ObjectId | string): Promise<BookmarkFolderDocument[]> {
  const parentFolder = await this.findById(parentFolderId) as unknown as BookmarkFolderDocument;
  const childFolders = await this.find({ parent: parentFolder });
  return childFolders;
};

bookmarkFolderSchema.statics.deleteFolderAndChildren = async function(bookmarkFolderId: Types.ObjectId | string): Promise<{deletedCount: number}> {
  const bookmarkFolder = await this.findById(bookmarkFolderId);
  // Delete parent and all children folder
  let deletedCount = 0;
  if (bookmarkFolder != null) {
    // Delete Bookmarks
    const bookmarks = bookmarkFolder?.bookmarks;
    if (bookmarks && bookmarks.length > 0) {
      await Bookmark.deleteMany({ _id: { $in: bookmarks } });
    }
    // Delete all child recursively and update deleted count
    const childFolders = await this.find({ parent: bookmarkFolder });
    await Promise.all(childFolders.map(async(child) => {
      const deletedChildFolder = await this.deleteFolderAndChildren(child._id);
      deletedCount += deletedChildFolder.deletedCount;
    }));
    const deletedChild = await this.deleteMany({ parent: bookmarkFolder });
    deletedCount += deletedChild.deletedCount + 1;
    bookmarkFolder.delete();
  }
  return { deletedCount };
};

bookmarkFolderSchema.statics.updateBookmarkFolder = async function(bookmarkFolderId: string, name: string, parent: string):
 Promise<BookmarkFolderDocument> {
  const parentFolder = await this.findById(parent);
  const updateFields = {
    name, parent: parentFolder?._id || null,
  };
  const bookmarkFolder = await this.findByIdAndUpdate(bookmarkFolderId, { $set: updateFields }, { new: true });
  if (bookmarkFolder == null) {
    throw new Error('Update bookmark folder failed');
  }
  return bookmarkFolder;

};

bookmarkFolderSchema.statics.insertOrUpdateBookmarkedPage = async function(pageId: IPageHasId, userId: Types.ObjectId | string, folderId: string):
Promise<BookmarkFolderDocument> {

  // Create bookmark or update existing
  const bookmarkedPage = await Bookmark.findOneAndUpdate({ page: pageId, user: userId }, { page: pageId, user: userId }, { new: true, upsert: true });

  // Remove existing bookmark in bookmark folder
  await this.updateMany({}, { $pull: { bookmarks:  bookmarkedPage._id } });

  // Insert bookmark into bookmark folder
  const bookmarkFolder = await this.findByIdAndUpdate(folderId, { $addToSet: { bookmarks: bookmarkedPage } }, { new: true, upsert: true });
  return bookmarkFolder;
};

export default getOrCreateModel<BookmarkFolderDocument, BookmarkFolderModel>('BookmarkFolder', bookmarkFolderSchema);
