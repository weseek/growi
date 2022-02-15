import mongoose, {
  Schema, Model, Document,
} from 'mongoose';
import { getOrCreateModel } from '@growi/core';

import {
  IPageForResuming, IUserForResuming, IOptionsForResuming,
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
  fromPath: string,
  toPath?: string,
  page: IPageForResuming,
  user: IUserForResuming,
  options?: IOptionsForResuming,
  incForUpdatingDescendantCount?: number,
}

export interface PageOperationDocument extends IPageOperation, Document {}

export interface PageOperationModel extends Model<PageOperationDocument> {
  [x:string]: any // TODO: improve type
}

const pageSchemaForResuming = new Schema<IPageForResuming>({
  _id: { type: ObjectId, ref: 'Page' },
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
});

const userSchemaForResuming = new Schema<IUserForResuming>({
  _id: { type: ObjectId, ref: 'User', required: true },
});

const optionsSchemaForResuming = new Schema<IOptionsForResuming>({
  createRedirectPage: { type: Boolean },
  updateMetadata: { type: Boolean },
}, { _id: false });

const schema = new Schema<PageOperationDocument, PageOperationModel>({
  actionType: {
    type: String,
    enum: PageActionType,
    required: true,
    index: true,
  },
  fromPath: { type: String, required: true },
  toPath: { type: String },
  page: { type: pageSchemaForResuming, required: true },
  user: { type: userSchemaForResuming, required: true },
  options: { type: optionsSchemaForResuming },
  incForUpdatingDescendantCount: { type: Number },
});

export default getOrCreateModel<PageOperationDocument, PageOperationModel>('PageOperation', schema);
