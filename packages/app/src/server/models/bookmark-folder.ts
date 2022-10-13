import { Ref, IUser, IUserHasId } from '@growi/core';

import {  Model, Schema, Document } from 'mongoose';
import { getOrCreateModel } from '../util/mongoose-utils';

export interface BookmarkFolderDocument extends Document {
  name : string,
  owner: Ref<IUser>,
  parent?: BookmarkFolderDocument
}

export type BookmarkFolderModel = Model<BookmarkFolderDocument>

const bookmarkFolderSchema = new Schema<BookmarkFolderDocument, BookmarkFolderModel>({
  name: {type: String},
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  parent: { type: Schema.Types.ObjectId, ref: 'BookmarkFolder', required: false}
});

bookmarkFolderSchema.statics.createBookmarkFolder = async function (name: string, user:IUserHasId, parent?: BookmarkFolderDocument ): Promise<BookmarkFolderDocument> {
  const BookmarkFolder = this;
  const bookmarkFolder = new BookmarkFolder();
  bookmarkFolder.name = name;
  bookmarkFolder.owner = user._id;
  if(parent != null ){
    bookmarkFolder.parent = parent._id;
  }
  return bookmarkFolder.save()
}

export default getOrCreateModel<BookmarkFolderDocument, BookmarkFolderModel>('BookmarkFolder', bookmarkFolderSchema)
