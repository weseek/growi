/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Schema, Model, Document,
} from 'mongoose';

import { getOrCreateModel } from '../util/mongoose-utils';

export interface IPageRedirectChains {
  start: IPageRedirect,
  end: IPageRedirect,
}

export interface IPageRedirect {
  fromPath: string,
  toPath: string,
}

export interface PageRedirectDocument extends IPageRedirect, Document {}

export interface PageRedirectModel extends Model<PageRedirectDocument> {
  retrievePageRedirectChains(fromPath: string, storedChains?: IPageRedirectChains): Promise<IPageRedirectChains>
  removePageRedirectByToPath(toPath: string): Promise<void>
}

const schema = new Schema<PageRedirectDocument, PageRedirectModel>({
  fromPath: {
    type: String, required: true, unique: true, index: true,
  },
  toPath: { type: String, required: true },
});

schema.statics.retrievePageRedirectChains = async function(fromPath: string, storedChains?: IPageRedirectChains): Promise<IPageRedirectChains|null> {
  const chainedRedirect = await this.findOne({ fromPath });

  if (chainedRedirect == null) {
    return storedChains ?? null;
  }

  const chains = storedChains ?? { start: chainedRedirect, end: chainedRedirect };
  chains.end = chainedRedirect;

  // find the end recursively
  return this.retrievePageRedirectChains(chainedRedirect.toPath, chains);
};

schema.statics.removePageRedirectByToPath = async function(toPath: string): Promise<void> {
  await this.deleteMany({ toPath });

  return;
};

// schema.statics.removePageRedirectsByChains = async function(redirectChains: IPageRedirectChains): Promise<void> {
//   return;
// };

export default getOrCreateModel<PageRedirectDocument, PageRedirectModel>('PageRedirect', schema);
