import { GrowiThemeMetadata, GrowiThemeSchemeType } from '@growi/core';
import {
  Schema, type Model, type Document, type Types,
} from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import { GrowiPluginResourceType } from '../interfaces';
import type {
  IGrowiPlugin, IGrowiPluginMeta, IGrowiPluginOrigin, IGrowiThemePluginMeta,
} from '../interfaces';

export interface IGrowiPluginDocument extends IGrowiPlugin, Document {
}
export interface IGrowiPluginModel extends Model<IGrowiPluginDocument> {
  findEnabledPlugins(): Promise<IGrowiPlugin[]>
  findEnabledPluginsIncludingAnyTypes(includingTypes: GrowiPluginResourceType[]): Promise<IGrowiPlugin[]>
  activatePlugin(id: Types.ObjectId): Promise<string>
  deactivatePlugin(id: Types.ObjectId): Promise<string>
}

const growiThemeMetadataSchema = new Schema<GrowiThemeMetadata>({
  name: { type: String, required: true },
  manifestKey: { type: String, required: true },
  schemeType: {
    type: String,
    enum: GrowiThemeSchemeType,
    require: true,
  },
  bg: { type: String, required: true },
  topbar: { type: String, required: true },
  sidebar: { type: String, required: true },
  accent: { type: String, required: true },
});

const growiPluginMetaSchema = new Schema<IGrowiPluginMeta|IGrowiThemePluginMeta>({
  name: { type: String, required: true },
  types: {
    type: [String],
    enum: GrowiPluginResourceType,
    require: true,
  },
  desc: { type: String },
  author: { type: String },
  themes: [growiThemeMetadataSchema],
});

const growiPluginOriginSchema = new Schema<IGrowiPluginOrigin>({
  url: { type: String },
  ghBranch: { type: String },
  ghTag: { type: String },
});

const growiPluginSchema = new Schema<IGrowiPluginDocument, IGrowiPluginModel>({
  isEnabled: { type: Boolean },
  installedPath: { type: String },
  organizationName: { type: String },
  origin: growiPluginOriginSchema,
  meta: growiPluginMetaSchema,
});

growiPluginSchema.statics.findEnabledPlugins = async function(): Promise<IGrowiPlugin[]> {
  return this.find({ isEnabled: true });
};

growiPluginSchema.statics.findEnabledPluginsIncludingAnyTypes = async function(types: GrowiPluginResourceType[]): Promise<IGrowiPlugin[]> {
  return this.find({
    isEnabled: true,
    'meta.types': { $in: types },
  });
};

growiPluginSchema.statics.activatePlugin = async function(id: Types.ObjectId): Promise<string> {
  const growiPlugin = await this.findOneAndUpdate({ _id: id }, { isEnabled: true });
  if (growiPlugin == null) {
    const message = 'No plugin found for this ID.';
    throw new Error(message);
  }
  const pluginName = growiPlugin.meta.name;
  return pluginName;
};

growiPluginSchema.statics.deactivatePlugin = async function(id: Types.ObjectId): Promise<string> {
  const growiPlugin = await this.findOneAndUpdate({ _id: id }, { isEnabled: false });
  if (growiPlugin == null) {
    const message = 'No plugin found for this ID.';
    throw new Error(message);
  }
  const pluginName = growiPlugin.meta.name;
  return pluginName;
};

export const GrowiPlugin = getOrCreateModel<IGrowiPluginDocument, IGrowiPluginModel>('GrowiPlugin', growiPluginSchema);
