import { isValidObjectId } from '@growi/core/src/utils/objectid-utils';
import monggoose, {
  Types, Document, Model, Schema,
} from 'mongoose';


import { IBookmarkFolder, BookmarkFolderItems } from '~/interfaces/bookmark-info';
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
  parent?: [this]
  bookmarks?: [Types.ObjectId]
}

export interface BookmarkFolderModel extends Model<BookmarkFolderDocument>{
  createByParameters(params: IBookmarkFolder): BookmarkFolderDocument
  findFolderAndChildren(user: Types.ObjectId | string, parentId?: Types.ObjectId | string): BookmarkFolderItems[]
  findChildFolderById(parentBookmarkFolder: Types.ObjectId | string): Promise<BookmarkFolderDocument[]>
  deleteFolderAndChildren(bookmarkFolderId: Types.ObjectId | string): {deletedCount: number}
  updateBookmarkFolder(bookmarkFolderId: string, name: string, parent: string): BookmarkFolderDocument | null
  insertOrUpdateBookmarkedPage(pageId: IPageHasId, userId: Types.ObjectId | string, folderId: string)
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
    .populate({ path: 'children' })
    .populate({
      path: 'bookmarks',
      model: 'Bookmark',
      populate: {
        path: 'page',
        model: 'Page',
      },
    }).exec() as unknown as BookmarkFolderItems[];
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

bookmarkFolderSchema.statics.insertOrUpdateBookmarkedPage = async function(pageId: IPageHasId, userId: Types.ObjectId | string, folderId: string):
Promise<BookmarkFolderDocument | null> {

  // Create bookmark or update existing
  const bookmarkedPage = await Bookmark.findOneAndUpdate({ page: pageId, user: userId }, { page: pageId, user: userId }, { new: true, upsert: true });

  // Remove existing bookmark in bookmark folder
  await this.updateMany({}, { $pull: { bookmarks:  bookmarkedPage._id } });

  // Insert bookmark into bookmark folder
  const bookmarkFolder = await this.findByIdAndUpdate(folderId, { $addToSet: { bookmarks: bookmarkedPage } }, { new: true, upsert: true });
  return bookmarkFolder;
};


export default getOrCreateModel<BookmarkFolderDocument, BookmarkFolderModel>('BookmarkFolder', bookmarkFolderSchema);
