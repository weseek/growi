import {
  Schema, Types, Model, Document,
} from 'mongoose';

import path from 'path';

import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
import { addSeconds } from 'date-fns';
import loggerFactory from '~/utils/logger';

import { getOrCreateModel } from '../util/mongoose-utils';
import { Attachment as IAttachment } from '~/interfaces/page';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:models:attachment');

function generateFileHash(fileName:string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const hash = require('crypto').createHash('md5');
  hash.update(`${fileName}_${Date.now()}`);

  return hash.digest('hex');
}


const schema:Schema<IAttachment & Document> = new Schema<IAttachment & Document>({
  page: { type: Types.ObjectId, ref: 'Page', index: true },
  creator: { type: Types.ObjectId, ref: 'User', index: true },
  filePath: { type: String }, // DEPRECATED: remains for backward compatibility for v3.3.x or below
  fileName: { type: String, required: true, unique: true },
  originalName: { type: String },
  fileFormat: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  temporaryUrlCached: { type: String },
  temporaryUrlExpiredAt: { type: Date },
});

schema.plugin(uniqueValidator);
schema.plugin(mongoosePaginate);

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });


class Attachment extends Model {

  static createWithoutSave(pageId, user, fileStream, originalName, fileFormat, fileSize) {
    const extname = path.extname(originalName);
    let fileName = generateFileHash(originalName);
    if (extname.length > 1) { // ignore if empty or '.' only
      fileName = `${fileName}${extname}`;
    }

    const attachment = new this();
    attachment.page = pageId;
    attachment.creator = user._id;
    attachment.originalName = originalName;
    attachment.fileName = fileName;
    attachment.fileFormat = fileFormat;
    attachment.fileSize = fileSize;
    attachment.createdAt = Date.now();

    return attachment;
  }


  getValidTemporaryUrl() {
    if (this.temporaryUrlExpiredAt == null) {
      return null;
    }
    // return null when expired url
    if (this.temporaryUrlExpiredAt.getTime() < new Date().getTime()) {
      return null;
    }
    return this.temporaryUrlCached;
  }

  cashTemporaryUrlByProvideSec(temporaryUrl, provideSec) {
    if (temporaryUrl == null) {
      throw new Error('url is required.');
    }
    this.temporaryUrlCached = temporaryUrl;
    this.temporaryUrlExpiredAt = addSeconds(new Date(), provideSec);

    return this.save();
  }

}


schema.virtual('filePathProxied').get(function(this: { _id : Types.ObjectId }) {
  return `/attachment/${this._id}`;
});

schema.virtual('downloadPathProxied').get(function(this: { _id : Types.ObjectId }) {
  return `/download/${this._id}`;
});

schema.loadClass(Attachment);
export default getOrCreateModel<IAttachment & Document>('Attachment', schema);
