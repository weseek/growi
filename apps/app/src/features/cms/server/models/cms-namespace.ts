import {
  Schema, type Model, type Document,
} from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import type { ICmsNamespace } from '../../interfaces';

export interface ICmsNamespaceDocument extends ICmsNamespace, Document {
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICmsNamespaceModel extends Model<ICmsNamespaceDocument> {
}

const cmsNamespaceSchema = new Schema<ICmsNamespaceDocument, ICmsNamespace>({
  namespace: { type: String, required: true, unique: true },
  desc: { type: String },
  attributes: [Map],
  meta: Map,
});

export const CmsNamespace = getOrCreateModel<ICmsNamespaceDocument, ICmsNamespaceModel>('CmsNamespace', cmsNamespaceSchema);
