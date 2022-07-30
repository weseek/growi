/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Schema, Model, Document,
} from 'mongoose';

import loggerFactory from '~/utils/logger';

import { getOrCreateModel } from '../util/mongoose-utils';


const logger = loggerFactory('growi:models:page-redirects');


export type IPageRedirect = {
  fromPath: string,
  toPath: string,
}

const CHAINS_ATTRIBUTE_NAME = 'chains';
type IPageRedirectChains = IPageRedirect & { [CHAINS_ATTRIBUTE_NAME]: IPageRedirect[] };

export type IPageRedirectEndpoints = {
  start: IPageRedirect,
  end: IPageRedirect,
}


export interface PageRedirectDocument extends IPageRedirect, Document {}

export interface PageRedirectModel extends Model<PageRedirectDocument> {
  retrievePageRedirectEndpoints(fromPath: string): Promise<IPageRedirectEndpoints>
  removePageRedirectByToPath(toPath: string): Promise<void>
}

const schema = new Schema<PageRedirectDocument, PageRedirectModel>({
  fromPath: {
    type: String, required: true, unique: true, index: true,
  },
  toPath: { type: String, required: true },
});

schema.statics.retrievePageRedirectEndpoints = async function(fromPath: string): Promise<IPageRedirectEndpoints|null> {
  const chainedRedirect: IPageRedirectChains[] = await this.aggregate([
    { $match: { fromPath } },
    {
      $graphLookup: {
        from: 'pageredirects',
        startWith: '$toPath',
        connectFromField: 'toPath',
        connectToField: 'fromPath',
        as: CHAINS_ATTRIBUTE_NAME,
      },
    },
  ]);

  if (chainedRedirect.length === 0) {
    return null;
  }

  if (chainedRedirect.length > 1) {
    logger.warn(`Although two or more PageRedirect documents starts from '${fromPath}' exists, The first one is used.`);
  }

  const chains = chainedRedirect[0];
  const start = { fromPath: chains.fromPath, toPath: chains.toPath };
  const chainsNum = chains[CHAINS_ATTRIBUTE_NAME].length;
  const end = chainsNum === 0
    ? start
    : chains[CHAINS_ATTRIBUTE_NAME][chainsNum - 1];

  return { start, end };
};

schema.statics.removePageRedirectByToPath = async function(toPath: string): Promise<void> {
  await this.deleteMany({ toPath });

  return;
};

// schema.statics.removePageRedirectsByChains = async function(redirectChains: IPageRedirectChains): Promise<void> {
//   return;
// };

export default getOrCreateModel<PageRedirectDocument, PageRedirectModel>('PageRedirect', schema);
