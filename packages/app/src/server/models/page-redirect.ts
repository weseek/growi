/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Schema, Model, Document,
} from 'mongoose';

import { getOrCreateModel } from '../util/mongoose-utils';

export interface IPageRedirect {
  fromPath: string,
  toPath: string,
}

export interface PageRedirectDocument extends IPageRedirect, Document {}

export interface PageRedirectModel extends Model<PageRedirectDocument> {
  [x:string]: any // TODO: improve type
}

const schema = new Schema<PageRedirectDocument, PageRedirectModel>({
  fromPath: {
    type: String, required: true, unique: true, index: true,
  },
  toPath: { type: String, required: true },
});

schema.statics.removePageRedirectByToPath = async function(toPath: string): Promise<void> {
  await this.deleteMany({ toPath });

  return;
};

export default getOrCreateModel<PageRedirectDocument, PageRedirectModel>('PageRedirect', schema);
