import {
  Types, Document, Schema, Model,
} from 'mongoose';

import { getOrCreateModel } from '@growi/core';


export interface IPageOperation {
  pageId: Types.ObjectId
  createdAt: Date
  expiredAt: Date
}

export interface PageOperationDocument extends IPageOperation, Document {
  isExpired(): Promise<boolean>
}

export type PageOperationModel = Model<PageOperationDocument>

const pageOperationSchema = new Schema<PageOperationDocument, PageOperationModel>({
  pageId: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    index: true,
    require: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
    required: true,
  },
  expiredAt: {
    type: Date,
    // 1 hour after being created a document
    default: new Date(Date.now() + 3600000),
    required: true,
  },
});

pageOperationSchema.methods.isExpired = function() {
  return this.expiredAt.getTime() < Date.now();
};


const PageOperation = getOrCreateModel<PageOperationDocument, PageOperationModel>('PageOperation', pageOperationSchema);

export { PageOperation };
