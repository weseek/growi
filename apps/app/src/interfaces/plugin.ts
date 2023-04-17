import { GrowiThemeMetadata, HasObjectId } from '@growi/core';

export const GrowiPluginResourceType = {
  Template: 'template',
  Style: 'style',
  Theme: 'theme',
  Script: 'script',
} as const;
export type GrowiPluginResourceType = typeof GrowiPluginResourceType[keyof typeof GrowiPluginResourceType];

export type GrowiPluginOrigin = {
  url: string,
  ghBranch?: string,
  ghTag?: string,
}

export type GrowiPlugin<M extends GrowiPluginMeta = GrowiPluginMeta> = {
  isEnabled: boolean,
  installedPath: string,
  organizationName: string,
  origin: GrowiPluginOrigin,
  meta: M,
}

export type GrowiPluginMeta = {
  name: string,
  types: GrowiPluginResourceType[],
  desc?: string,
  author?: string,
}

export type GrowiThemePluginMeta = GrowiPluginMeta & {
  themes: GrowiThemeMetadata[]
}

export type GrowiPluginHasId = GrowiPlugin & HasObjectId;
