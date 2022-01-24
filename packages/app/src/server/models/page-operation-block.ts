import {
  Document, Schema, Model,
} from 'mongoose';

import { getOrCreateModel } from '@growi/core';


export interface IPageOperationBlock {
  path: string
  expiredAt: Date
}

export interface PageOperationBlockDocument extends IPageOperationBlock, Document {
  isExpired(): boolean
}

export type PageOperationBlockModel = Model<PageOperationBlockDocument>

const pageOperationBlockSchema = new Schema<PageOperationBlockDocument, PageOperationBlockModel>({
  path: { type: String },
  expiredAt: {
    type: Date,
    // 5 mins after being created a document
    default: new Date(Date.now() + 300000),
    required: true,
  },
});

pageOperationBlockSchema.methods.isExpired = function() {
  return this.expiredAt.getTime() < Date.now();
};


const PageOperationBlock = getOrCreateModel<PageOperationBlockDocument, PageOperationBlockModel>('PageOperationBlock', pageOperationBlockSchema);

export { PageOperationBlock };
