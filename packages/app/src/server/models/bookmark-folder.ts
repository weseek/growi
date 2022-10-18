import { Ref, IUser } from '@growi/core';
import {
  Types, Document, Model, Schema,
} from 'mongoose';


import loggerFactory from '../../utils/logger';
import { getOrCreateModel } from '../util/mongoose-utils';

const logger = loggerFactory('growi:models:bookmark-folder');

export type IBookmarkFolderDocument = {
  name: string
  owner: Ref<IUser>
  parent?: Ref<IBookmarkFolderDocument>
}
export interface BookmarkFolderDocument extends Document {
  _id: Types.ObjectId
  name: string
  owner: Types.ObjectId
  parent?: BookmarkFolderDocument
}

export interface BookmarkFolderModel extends Model<BookmarkFolderDocument>{
  createByParameters(params: IBookmarkFolderDocument): IBookmarkFolderDocument
  findParentFolderByUserId(user: Types.ObjectId | string): IBookmarkFolderDocument[]
  findChildFolderById(parentBookmarkFolder: Types.ObjectId | string): Promise<IBookmarkFolderDocument[]>
  deleteFolderAndChildren(bookmarkFolderId: string): void
}

const bookmarkFolderSchema = new Schema<BookmarkFolderDocument, BookmarkFolderModel>({
  name: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  parent: { type: Schema.Types.ObjectId, refPath: 'BookmarkFolder', required: false },
});


bookmarkFolderSchema.statics.createByParameters = async function(params: IBookmarkFolderDocument): Promise<BookmarkFolderDocument> {
  const bookmarkFolder = await this.create(params) as unknown as BookmarkFolderDocument;
  return bookmarkFolder;
};

bookmarkFolderSchema.statics.findParentFolderByUserId = async function(userId: Types.ObjectId | string): Promise<BookmarkFolderDocument[]> {
  const bookmarks = this.find({ owner: userId }, { parent: null }) as unknown as BookmarkFolderDocument[];
  return bookmarks;
};

bookmarkFolderSchema.statics.findChildFolderById = async function(parentFolderId: Types.ObjectId | string): Promise<BookmarkFolderDocument[]> {
  const parentFolder = this.findById(parentFolderId) as unknown as BookmarkFolderDocument;
  const childFolders = this.find({ parent: parentFolder.id });
  return childFolders;
};

bookmarkFolderSchema.statics.deleteFolderAndChildren = async function(boookmarkFolderId: string): Promise<void> {
  // Delete parent and all children folder
  const bookmarkFolder = await this.findByIdAndDelete(boookmarkFolderId);
  await this.deleteMany({ parent: bookmarkFolder?.id });
};

export default getOrCreateModel<BookmarkFolderDocument, BookmarkFolderModel>('BookmarkFolder', bookmarkFolderSchema);
