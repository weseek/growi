import { Ref, IUser } from '@growi/core';
import ExtensibleCustomError from 'extensible-custom-error';
import {
  Types, Document, Model, Schema,
} from 'mongoose';


import loggerFactory from '../../utils/logger';
import { getOrCreateModel } from '../util/mongoose-utils';

const logger = loggerFactory('growi:models:bookmark-folder');

export class InvalidParentBookmarkFolder extends ExtensibleCustomError {}


export type IBookmarkFolderDocument = {
  name: string
  owner: Ref<IUser>
  parent?: Ref<BookmarkFolderDocument>
}
export interface BookmarkFolderDocument extends Document {
  _id: Types.ObjectId
  name: string
  owner: Types.ObjectId
  parent?: Types.ObjectId | null
}

export interface BookmarkFolderModel extends Model<BookmarkFolderDocument>{
  createByParameters(params: IBookmarkFolderDocument): IBookmarkFolderDocument
  findParentFolderByUserId(user: Types.ObjectId | string): IBookmarkFolderDocument[]
  findChildFolderById(parentBookmarkFolder: Types.ObjectId | string): Promise<IBookmarkFolderDocument[]>
  deleteFolderAndChildren(bookmarkFolderId: string): void
  updateBookmarkFolder(bookmarkFolderId: string, name: string, parent: string): BookmarkFolderDocument | null
}

const bookmarkFolderSchema = new Schema<BookmarkFolderDocument, BookmarkFolderModel>({
  name: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  parent: { type: Schema.Types.ObjectId, ref: 'BookmarkFolder', required: false },
});


bookmarkFolderSchema.statics.createByParameters = async function(params: IBookmarkFolderDocument): Promise<BookmarkFolderDocument> {
  const { name, owner, parent } = params;
  let bookmarkFolder;
  try {
    if (parent === null) {
      bookmarkFolder = await this.create({ name, owner, parent:  null }) as unknown as BookmarkFolderDocument;
    }
    else {
      const parentFolder = await this.findById(parent);
      if (!parentFolder) {
        throw new InvalidParentBookmarkFolder("Parent folder doesn't exists");
      }
      bookmarkFolder = await this.create({ name, owner, parent:  parentFolder?._id }) as unknown as BookmarkFolderDocument;
    }
  }
  catch (err) {
    if (err instanceof InvalidParentBookmarkFolder) {
      throw new InvalidParentBookmarkFolder(err);
    }
    return err;
  }
  return bookmarkFolder;
};

bookmarkFolderSchema.statics.findParentFolderByUserId = async function(userId: Types.ObjectId | string): Promise<BookmarkFolderDocument[]> {
  const bookmarks = this.find({ owner: userId, parent: null }) as unknown as BookmarkFolderDocument[];
  return bookmarks;
};

bookmarkFolderSchema.statics.findChildFolderById = async function(parentFolderId: Types.ObjectId | string): Promise<BookmarkFolderDocument[]> {
  const parentFolder = await this.findById(parentFolderId) as unknown as BookmarkFolderDocument;
  const childFolders = await this.find({ parent: parentFolder._id });
  return childFolders;
};

bookmarkFolderSchema.statics.deleteFolderAndChildren = async function(boookmarkFolderId: string): Promise<void> {
  // Delete parent and all children folder
  const bookmarkFolder = await this.findByIdAndDelete(boookmarkFolderId);
  await this.deleteMany({ parent: bookmarkFolder?.id });
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

export default getOrCreateModel<BookmarkFolderDocument, BookmarkFolderModel>('BookmarkFolder', bookmarkFolderSchema);
