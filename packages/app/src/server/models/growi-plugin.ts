import {
  Schema, Model, Document,
} from 'mongoose';

import {
  GrowiPlugin, GrowiPluginMeta, GrowiPluginOrigin, GrowiPluginResourceType,
} from '~/interfaces/plugin';

import { getOrCreateModel } from '../util/mongoose-utils';

export interface GrowiPluginDocument extends GrowiPlugin, Document {
}
export type GrowiPluginModel = Model<GrowiPluginDocument>

const growiPluginMetaSchema = new Schema<GrowiPluginMeta>({
  name: { type: String, required: true },
  types: {
    type: [String],
    enum: GrowiPluginResourceType,
    require: true,
  },
  desc: { type: String },
  author: { type: String },
});

const growiPluginOriginSchema = new Schema<GrowiPluginOrigin>({
  url: { type: String },
  ghBranch: { type: String },
  ghTag: { type: String },
});

const growiPluginSchema = new Schema<GrowiPluginDocument, GrowiPluginModel>({
  isEnabled: { type: Boolean },
  installedPath: { type: String },
  origin: growiPluginOriginSchema,
  meta: growiPluginMetaSchema,
});


export default getOrCreateModel<GrowiPluginDocument, GrowiPluginModel>('GrowiPlugin', growiPluginSchema);
