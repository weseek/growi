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
  path: { type: String, required: true },
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

pageOperationBlockSchema.statics.createDocument = function(path) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const pageOperationBlock = new PageOperationBlock({ path });
  pageOperationBlock.save();
  return pageOperationBlock;
};

const PageOperationBlock = getOrCreateModel<PageOperationBlockDocument, PageOperationBlockModel>('PageOperationBlock', pageOperationBlockSchema);

export { PageOperationBlock };
