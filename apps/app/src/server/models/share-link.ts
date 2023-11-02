import mongoose, { Schema } from 'mongoose';
import type {
  Document, Model,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import type { IShareLink } from '~/interfaces/share-link';

import { getOrCreateModel } from '../util/mongoose-utils';


export interface ShareLinkDocument extends IShareLink, Document {}

export interface ShareLinkModel extends Model<ShareLinkDocument>{
  isExpired: () => boolean,
}


/*
 * define schema
 */
const ObjectId = mongoose.Schema.Types.ObjectId;
const schema = new Schema<ShareLinkDocument, ShareLinkModel>({
  relatedPage: {
    type: ObjectId,
    ref: 'Page',
    required: true,
    index: true,
  },
  expiredAt: { type: Date },
  description: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

schema.methods.isExpired = function() {
  if (this.expiredAt == null) {
    return false;
  }
  return this.expiredAt.getTime() < new Date().getTime();
};

export default getOrCreateModel<ShareLinkDocument, ShareLinkModel>('ShareLink', schema);
