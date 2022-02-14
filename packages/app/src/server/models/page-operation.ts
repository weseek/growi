import mongoose, {
  Schema, Model, Document,
} from 'mongoose';
import { getOrCreateModel } from '@growi/core';

import {
  IPageForResuming,
} from '~/server/interfaces/page-operation';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Schema.Types.ObjectId;

const PageActionType = {
  Rename: 'Rename',
  Duplicate: 'Duplicate',
  Delete: 'Delete',
  DeleteCompletely: 'DeleteCompletely',
  Revert: 'Revert',
  NormalizeParent: 'NormalizeParent',
} as const;

export type PageActionType = typeof PageActionType[keyof typeof PageActionType];

/*
 * Main Schema
 */
export interface IPageOperation {
  actionType: PageActionType,
  pathsToBlock: string[],
  page: IPageForResuming,
}

export interface PageOperationDocument extends IPageOperation, Document {}

export interface PageOperationModel extends Model<PageOperationDocument> {
  [x:string]: any // TODO: improve type
}

const pageArgSchema = new Schema<IPageForResuming>({
  parent: { type: ObjectId, ref: 'Page' },
  descendantCount: { type: Number },
  isEmpty: { type: Boolean },
  path: { type: String, required: true },
  revision: { type: ObjectId, ref: 'Revision' },
  status: { type: String },
  grant: { type: Number },
  grantedUsers: [{ type: ObjectId, ref: 'User' }],
  grantedGroup: { type: ObjectId, ref: 'UserGroup' },
  creator: { type: ObjectId, ref: 'User' },
  lastUpdateUser: { type: ObjectId, ref: 'User' },
}, { strict: false, strictQuery: false });

const schema = new Schema<PageOperationDocument, PageOperationModel>({
  actionType: {
    type: String,
    enum: PageActionType,
    required: true,
    index: true,
  },
  pathsToBlock: [
    {
      type: String,
      required: true,
      validate: [v => v.length >= 1, 'Must have minimum one path'],
    },
  ],
  page: { type: pageArgSchema, required: true },
});

export default getOrCreateModel<PageOperationDocument, PageOperationModel>('PageOperation', schema);
