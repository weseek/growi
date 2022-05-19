import { getOrCreateModel } from '@growi/core';
import {
  Types, Model, Schema,
} from 'mongoose';

const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');


export interface ShareLinkDocument {
  _id: Types.ObjectId;
  relatedPage: Types.ObjectId;
  description: string;
  expiredAt: Date;
  createdAt: Date;

  isExpired(): boolean
}


export type ShareLinkModel = Model<ShareLinkDocument>


const shareLinkSchema = new Schema<ShareLinkDocument, ShareLinkModel>({
  relatedPage: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    required: true,
    index: true,
  },
  expiredAt: { type: Date },
  description: { type: String },
  createdAt: { type: Date, default: Date.now, required: true },
});
shareLinkSchema.plugin(mongoosePaginate);
shareLinkSchema.plugin(uniqueValidator);


shareLinkSchema.methods.isExpired = function(): boolean {
  if (this.expiredAt == null) {
    return false;
  }
  return this.expiredAt.getTime() < new Date().getTime();
};


export default getOrCreateModel<ShareLinkDocument, ShareLinkModel>('ShareLink', shareLinkSchema);
