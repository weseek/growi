import { Schema, Types, Model } from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import { getOrCreateModel } from '../util/mongoose-utils';
import { ShareLink as IShareLink } from '~/interfaces/page';

/*
 * define methods type
 */
interface ModelMethods{
  isExpired: ()=>boolean
}

/*
 * define schema
 */
const schema = new Schema<IShareLink>({
  relatedPage: {
    type: Types.ObjectId,
    ref: 'Page',
    required: true,
    index: true,
  },
  expiredAt: { type: Date },
  description: { type: String },
  createdAt: { type: Date, default: Date.now, required: true },
});
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);


class ShareLink extends Model {

  isExpired() {
    if (this.expiredAt == null) {
      return false;
    }
    return this.expiredAt.getTime() < new Date().getTime();
  }

}

schema.loadClass(ShareLink);
export default getOrCreateModel<IShareLink, ModelMethods>('ShareLink', schema);
