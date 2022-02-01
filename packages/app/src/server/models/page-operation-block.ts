import {
  Document, Schema, Model,
} from 'mongoose';

import { getOrCreateModel } from '@growi/core';


export interface IPageOperationBlock {
  path: string
  isActive: boolean
  expiredAt: Date
}
export interface PageOperationBlockDocument extends IPageOperationBlock, Document {
  isExpired(): boolean,
}

export interface PageOperationBlockModel extends Model<PageOperationBlockDocument> {
  create(path)
  findOneAndDeleteByPagePath(path)
  findActiveDocumentsByPaths(paths)
  findDocuments(path)
}

const pageOperationBlockSchema = new Schema<PageOperationBlockDocument, PageOperationBlockModel>({
  path: { type: String, required: true },
  isActive: { type: Boolean, required: true, default: true },
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

pageOperationBlockSchema.statics.create = function(path) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const pageOperationBlock = new PageOperationBlock({ path });
  pageOperationBlock.save();
  return pageOperationBlock;
};

pageOperationBlockSchema.statics.findOneAndDeleteByPath = async function(path) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return PageOperationBlock.findOneAndDelete({ path });

};


pageOperationBlockSchema.statics.findActiveDocumentsByPaths = function(paths) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return PageOperationBlock.find({ path: { $in: paths }, isActive: true });
};


pageOperationBlockSchema.statics.deleteAllInActiveDocuments = function() {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return PageOperationBlock.deleteMany({ isActive: false });
};


const PageOperationBlock = getOrCreateModel<PageOperationBlockDocument, PageOperationBlockModel>('PageOperationBlock', pageOperationBlockSchema);

export { PageOperationBlock };
