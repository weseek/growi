import { getOrCreateModel } from '@growi/core';
import {
  Document, Model, Schema,
} from 'mongoose';

import { PageDocument } from './page';

const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');


export interface ShareLinkDocument extends Document {
  relatedPage: PageDocument;
  expiredAt: Date;
  description: string;
  createdAt: Date

  isExpired(): boolean
}

export type ShareLinkModel = Model<ShareLinkDocument>

const shareLinkSchema = new Schema<ShareLinkDocument, ShareLinkModel>({
  relatedPage: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    require: true,
    index: true,
  },
  expiredAt: { type: Date },
  description: { type: String },
  createdAt: { type: Date, default: new Date(), required: true },
});
shareLinkSchema.plugin(mongoosePaginate);
shareLinkSchema.plugin(uniqueValidator);


shareLinkSchema.methods.isExpired = function() {
  if (this.expiredAt == null) {
    return false;
  }
  return this.expiredAt.getTime() < new Date().getTime();
};

export default getOrCreateModel<ShareLinkDocument, ShareLinkModel>('ShareLink', shareLinkSchema);
