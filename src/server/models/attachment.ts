import path from 'path';
import { Schema, Model } from 'mongoose';

import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';

import { createHash } from 'crypto';
import { addSeconds } from 'date-fns';
import { getOrCreateModel } from '~/server/util/mongoose-utils';
import { Attachment as IAttachment } from '~/interfaces/page';

const ObjectId = Schema.Types.ObjectId;

/*
 * define methods type
 */
interface ModelMethods {
  getValidTemporaryUrl(): string| null;
}

function generateFileHash(fileName) {
  const hash = createHash('md5');
  hash.update(`${fileName}_${Date.now()}`);

  return hash.digest('hex');
}

const schema = new Schema<IAttachment>({
  page: { type: ObjectId, ref: 'Page', index: true },
  creator: { type: ObjectId, ref: 'User', index: true },
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

schema.virtual('filePathProxied').get(function(this) {
  return `/attachment/${this._id}`;
});

schema.virtual('downloadPathProxied').get(function(this) {
  return `/download/${this._id}`;
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

/**
 * UserGroup Class
 *
 * @class UserGroup
 */
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

schema.loadClass(Attachment);
export default getOrCreateModel<IAttachment, ModelMethods>('Attachment', schema);
