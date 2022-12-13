import { isValidObjectId } from '@growi/core/src/utils/objectid-utils';
import {
  Types, Document, Model, Schema, model,
} from 'mongoose';

import { IBookmarkFolder, BookmarkFolderItems, MyBookmarkList } from '~/interfaces/bookmark-info';
import { IPageHasId } from '~/interfaces/page';

import loggerFactory from '../../utils/logger';
import { getOrCreateModel } from '../util/mongoose-utils';

import { InvalidParentBookmarkFolderError } from './errors';


const logger = loggerFactory('growi:models:bookmark-folder');
const Bookmark = require('./bookmark');

const BookmarkSchema = model('Bookmark').schema;

export interface BookmarkFolderDocument extends Document {
  _id: Types.ObjectId
  name: string
  owner: Types.ObjectId
  parent?: [this]
  bookmarks: MyBookmarkList
}

export interface BookmarkFolderModel extends Model<BookmarkFolderDocument>{
  createByParameters(params: IBookmarkFolder): BookmarkFolderDocument
  findFolderAndChildren(user: Types.ObjectId | string, parentId?: Types.ObjectId | string): BookmarkFolderItems[]
  findChildFolderById(parentBookmarkFolder: Types.ObjectId | string): Promise<BookmarkFolderDocument[]>
  deleteFolderAndChildren(bookmarkFolderId: Types.ObjectId | string): {deletedCount: number}
  updateBookmarkFolder(bookmarkFolderId: string, name: string, parent: string): BookmarkFolderDocument | null
  insertOrUpdateBookmarkedPage(page: IPageHasId, userId: Types.ObjectId | string, folderId: string)
}

const bookmarkFolderSchema = new Schema<BookmarkFolderDocument, BookmarkFolderModel>({
  name: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  parent: { type: Schema.Types.ObjectId, ref: 'BookmarkFolder', required: false },
  bookmarks: { type: [BookmarkSchema], default: [], required: false },
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
  let bookmarkFolder;

  if (parent == null) {
    bookmarkFolder = await this.create({ name, owner }) as unknown as BookmarkFolderDocument;
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
    bookmarkFolder = await this.create({ name, owner, parent:  parentFolder._id }) as unknown as BookmarkFolderDocument;
  }

  return bookmarkFolder;
};

bookmarkFolderSchema.statics.findFolderAndChildren = async function(
    userId: Types.ObjectId | string,
    parentId?: Types.ObjectId | string,
): Promise<BookmarkFolderItems[]> {

  const parentFolder = await this.findById(parentId) as unknown as BookmarkFolderDocument;
  const bookmarkFolders = await this.find({ owner: userId, parent: parentFolder })
    .populate({ path: 'children' }).exec() as unknown as BookmarkFolderItems[];
  return bookmarkFolders;
};

bookmarkFolderSchema.statics.findChildFolderById = async function(parentFolderId: Types.ObjectId | string): Promise<BookmarkFolderDocument[]> {
  const parentFolder = await this.findById(parentFolderId) as unknown as BookmarkFolderDocument;
  const childFolders = await this.find({ parent: parentFolder });
  return childFolders;
};

bookmarkFolderSchema.statics.deleteFolderAndChildren = async function(boookmarkFolderId: Types.ObjectId | string): Promise<{deletedCount: number}> {
  // Delete parent and all children folder
  const bookmarkFolder = await this.findByIdAndDelete(boookmarkFolderId);
  let deletedCount = 0;
  if (bookmarkFolder != null) {
    // Delete all child recursively and update deleted count
    const childFolders = await this.find({ parent: bookmarkFolder });
    await Promise.all(childFolders.map(async(child) => {
      const deletedChildFolder = await this.deleteFolderAndChildren(child._id);
      deletedCount += deletedChildFolder.deletedCount;
    }));
    const deletedChild = await this.deleteMany({ parent: bookmarkFolder });
    deletedCount += deletedChild.deletedCount + 1;
  }
  return { deletedCount };
};

bookmarkFolderSchema.statics.updateBookmarkFolder = async function(bookmarkFolderId: string, name: string, parent: string):
 Promise<BookmarkFolderDocument | null> {

  const parentFolder = await this.findById(parent);
  const updateFields = {
    name, parent: parentFolder?._id || null,
  };
  const bookmarkFolder = await this.findByIdAndUpdate(bookmarkFolderId, { $set: updateFields }, { new: true });
  return bookmarkFolder;

};

bookmarkFolderSchema.statics.insertOrUpdateBookmarkedPage = async function(page: IPageHasId, userId: Types.ObjectId | string, folderId: string):
Promise<BookmarkFolderDocument> {
  const bookmarkedPage = await Bookmark.findOneAndUpdate({ page: page._id, user: userId }, { new: true, upsert: true });
  const bookmarkFolder = await this.findByIdAndUpdate(folderId, { $addToSet: { bookmarks: bookmarkedPage } }, { new: true, upsert: true });
  return bookmarkFolder;
};


export default getOrCreateModel<BookmarkFolderDocument, BookmarkFolderModel>('BookmarkFolder', bookmarkFolderSchema);
