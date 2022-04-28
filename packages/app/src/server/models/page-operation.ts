import { getOrCreateModel } from '@growi/core';
import mongoose, {
  Schema, Model, Document, QueryOptions, FilterQuery,
} from 'mongoose';

import {
  IPageForResuming, IUserForResuming, IOptionsForResuming,
} from '~/server/interfaces/page-operation';

import { ObjectIdLike } from '../interfaces/mongoose-utils';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Schema.Types.ObjectId;

export const PageActionType = {
  Rename: 'Rename',
  Duplicate: 'Duplicate',
  Delete: 'Delete',
  DeleteCompletely: 'DeleteCompletely',
  Revert: 'Revert',
  NormalizeParent: 'NormalizeParent',
} as const;
export type PageActionType = typeof PageActionType[keyof typeof PageActionType];

export const PageActionStage = {
  Main: 'Main',
  Sub: 'Sub',
} as const;
export type PageActionStage = typeof PageActionStage[keyof typeof PageActionStage];

export const PageOperationAutoUpdateTimerType = {
  ExtendSec: 5, // add this second(s) to current time
  IntervalSec: 5, // every this second(s)
  SelfStopSec: 20, // execute self-stop after this second(s)
} as const;

/*
 * Main Schema
 */
export interface IPageOperation {
  actionType: PageActionType,
  actionStage: PageActionStage,
  fromPath: string,
  toPath?: string,
  page: IPageForResuming,
  user: IUserForResuming,
  options?: IOptionsForResuming,
  incForUpdatingDescendantCount?: number,
  unprocessableExpiryDate?: Date,
}

export interface PageOperationDocument extends IPageOperation, Document {}

export type PageOperationDocumentHasId = PageOperationDocument & { _id: ObjectIdLike };

export interface PageOperationModel extends Model<PageOperationDocument> {
  findByIdAndUpdatePageActionStage(pageOpId: ObjectIdLike, stage: PageActionStage): Promise<PageOperationDocumentHasId | null>
  findMainOps(filter?: FilterQuery<PageOperationDocument>, projection?: any, options?: QueryOptions): Promise<PageOperationDocumentHasId[]>
}

const pageSchemaForResuming = new Schema<IPageForResuming>({
  _id: { type: ObjectId, ref: 'Page', index: true },
  parent: { type: ObjectId, ref: 'Page' },
  descendantCount: { type: Number },
  isEmpty: { type: Boolean },
  path: { type: String, required: true, index: true },
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
  prevDescendantCount: { type: Number },
}, { _id: false });

const schema = new Schema<PageOperationDocument, PageOperationModel>({
  actionType: {
    type: String,
    enum: PageActionType,
    required: true,
    index: true,
  },
  actionStage: {
    type: String,
    enum: PageActionStage,
    required: true,
    index: true,
  },
  fromPath: { type: String, required: true, index: true },
  toPath: { type: String, index: true },
  page: { type: pageSchemaForResuming, required: true },
  user: { type: userSchemaForResuming, required: true },
  options: { type: optionsSchemaForResuming },
  incForUpdatingDescendantCount: { type: Number },
  unprocessableExpiryDate: { type: Date, default: null },
});

schema.statics.findByIdAndUpdatePageActionStage = async function(
    pageOpId: ObjectIdLike, stage: PageActionStage,
): Promise<PageOperationDocumentHasId | null> {

  return this.findByIdAndUpdate(pageOpId, {
    $set: { actionStage: stage },
  }, { new: true });
};

schema.statics.findMainOps = async function(
    filter?: FilterQuery<PageOperationDocument>, projection?: any, options?: QueryOptions,
): Promise<PageOperationDocumentHasId[]> {

  return this.find(
    { ...filter, actionStage: PageActionStage.Main },
    projection,
    options,
  );
};

schema.statics.cleanup = async function(excludeActionTypeList: PageActionType[], excludeStage: PageActionStage): Promise<void> {
  await this.deleteMany({ actionType: { $nin: excludeActionTypeList }, actionStage: { $ne: excludeStage } });
};

export default getOrCreateModel<PageOperationDocument, PageOperationModel>('PageOperation', schema);
