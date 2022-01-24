import {
  Types, Document, Schema, Model,
} from 'mongoose';

import { getOrCreateModel } from '@growi/core';

export interface PageOperationDocument extends Document {
  _id: Types.ObjectId
  pageId: Types.ObjectId
  createdAt: Date
  expiredAt: Date
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


const PageOperation = getOrCreateModel<PageOperationDocument, PageOperationModel>('PageOperation', pageOperationSchema);

export { PageOperation };
