import { objectIdUtils } from '@growi/core';
import monggoose, {
  Types, Document, Model, Schema,
} from 'mongoose';

import { IBookmarkFolder, BookmarkFolderItems, MyBookmarkList } from '~/interfaces/bookmark-info';
import { IPageHasId } from '~/interfaces/page';

import loggerFactory from '../../utils/logger';
import { getOrCreateModel } from '../util/mongoose-utils';

import { InvalidParentBookmarkFolderError } from './errors';


const logger = loggerFactory('growi:models:bookmark-folder');
const Bookmark = monggoose.model('Bookmark');

export interface BookmarkFolderDocument extends Document {
  _id: Types.ObjectId
  name: string
  owner: Types.ObjectId
  parent?: Types.ObjectId | undefined
  bookmarks?: Types.ObjectId[],
  children?: BookmarkFolderDocument[]
}

export interface BookmarkFolderModel extends Model<BookmarkFolderDocument>{
  createByParameters(params: IBookmarkFolder): Promise<BookmarkFolderDocument>
  findFolderAndChildren(user: Types.ObjectId | string, parentId?: Types.ObjectId | string): Promise<BookmarkFolderItems[]>
  deleteFolderAndChildren(bookmarkFolderId: Types.ObjectId | string): Promise<{deletedCount: number}>
  updateBookmarkFolder(bookmarkFolderId: string, name: string, parent: string | null): Promise<BookmarkFolderDocument>
  insertOrUpdateBookmarkedPage(pageId: IPageHasId, userId: Types.ObjectId | string, folderId: string | null): Promise<BookmarkFolderDocument | null>
  findUserRootBookmarksItem(userId: Types.ObjectId| string): Promise<MyBookmarkList>
  updateBookmark(pageId: Types.ObjectId | string, status: boolean, userId: Types.ObjectId| string): Promise<BookmarkFolderDocument | null>
}

const bookmarkFolderSchema = new Schema<BookmarkFolderDocument, BookmarkFolderModel>({
  name: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'BookmarkFolder',
    required: false,
  },
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
    const isParentFolderIdValid = objectIdUtils.isValidObjectId(parent as string);

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
  const folderItems: BookmarkFolderItems[] = [];

  const folders = await this.find({ owner: userId, parent: parentId })
    .populate('children')
    .populate({
      path: 'bookmarks',
      model: 'Bookmark',
      populate: {
        path: 'page',
        model: 'Page',
      },
    });

  const promises = folders.map(async(folder) => {
    const children = await this.findFolderAndChildren(userId, folder._id);
    const {
      _id, name, owner, bookmarks, parent,
    } = folder;

    const res = {
      _id: _id.toString(),
      name,
      owner,
      bookmarks,
      children,
      parent,
    };
    return res;
  });

  const results = await Promise.all(promises) as unknown as BookmarkFolderItems[];
  folderItems.push(...results);
  return folderItems;
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
    const childFolders = await this.find({ parent: bookmarkFolder._id });
    await Promise.all(childFolders.map(async(child) => {
      const deletedChildFolder = await this.deleteFolderAndChildren(child._id);
      deletedCount += deletedChildFolder.deletedCount;
    }));
    const deletedChild = await this.deleteMany({ parent: bookmarkFolder._id });
    deletedCount += deletedChild.deletedCount + 1;
    bookmarkFolder.delete();
  }
  return { deletedCount };
};

bookmarkFolderSchema.statics.updateBookmarkFolder = async function(bookmarkFolderId: string, name: string, parentId: string | null):
 Promise<BookmarkFolderDocument> {
  const updateFields: {name: string, parent: Types.ObjectId | null} = {
    name: '',
    parent: null,
  };

  updateFields.name = name;
  const parentFolder = parentId ? await this.findById(parentId) : null;
  updateFields.parent = parentFolder?._id ?? null;

  // Maximum folder hierarchy of 2 levels
  // If the destination folder (parentFolder) has a parent, the source folder cannot be moved because the destination folder hierarchy is already 2.
  // If the drop source folder has child folders, the drop source folder cannot be moved because the drop source folder hierarchy is already 2.
  if (parentId != null) {
    if (parentFolder?.parent != null) {
      throw new Error('Update bookmark folder failed');
    }
    const bookmarkFolder = await this.findById(bookmarkFolderId).populate('children');
    if (bookmarkFolder?.children?.length !== 0) {
      throw new Error('Update bookmark folder failed');
    }
  }

  const bookmarkFolder = await this.findByIdAndUpdate(bookmarkFolderId, { $set: updateFields }, { new: true });
  if (bookmarkFolder == null) {
    throw new Error('Update bookmark folder failed');
  }
  return bookmarkFolder;

};

bookmarkFolderSchema.statics.insertOrUpdateBookmarkedPage = async function(pageId: IPageHasId, userId: Types.ObjectId | string, folderId: string | null):
Promise<BookmarkFolderDocument | null> {

  // Create bookmark or update existing
  const bookmarkedPage = await Bookmark.findOneAndUpdate({ page: pageId, user: userId }, { page: pageId, user: userId }, { new: true, upsert: true });

  // Remove existing bookmark in bookmark folder
  await this.updateMany({}, { $pull: { bookmarks:  bookmarkedPage._id } });

  // Insert bookmark into bookmark folder
  if (folderId != null) {
    const bookmarkFolder = await this.findByIdAndUpdate(folderId, { $addToSet: { bookmarks: bookmarkedPage } }, { new: true, upsert: true });
    return bookmarkFolder;
  }

  return null;
};

bookmarkFolderSchema.statics.findUserRootBookmarksItem = async function(userId: Types.ObjectId | string): Promise<MyBookmarkList> {
  const bookmarkIdsInFolders = await this.distinct('bookmarks', { owner: userId });
  const userRootBookmarks: MyBookmarkList = await Bookmark.find({
    _id: { $nin: bookmarkIdsInFolders },
    user: userId,
  }).populate({
    path: 'page',
    model: 'Page',
    populate: {
      path: 'lastUpdateUser',
      model: 'User',
    },
  });
  return userRootBookmarks;
};

bookmarkFolderSchema.statics.updateBookmark = async function(pageId: Types.ObjectId | string, status: boolean, userId: Types.ObjectId | string):
Promise<BookmarkFolderDocument | null> {
  // If isBookmarked
  if (status) {
    const bookmarkedPage = await Bookmark.findOne({ page: pageId, userId });
    const bookmarkFolder = await this.findOne({ owner: userId, bookmarks: { $in: [bookmarkedPage?._id] } });
    if (bookmarkFolder != null) {
      await this.updateOne({ owner: userId, _id: bookmarkFolder._id }, { $pull: { bookmarks:  bookmarkedPage?._id } });
    }

    if (bookmarkedPage) {
      await bookmarkedPage.delete();
    }
    return bookmarkFolder;
  }
  // else , Add bookmark
  await Bookmark.create({ page: pageId, user: userId });
  return null;
};
export default getOrCreateModel<BookmarkFolderDocument, BookmarkFolderModel>('BookmarkFolder', bookmarkFolderSchema);
