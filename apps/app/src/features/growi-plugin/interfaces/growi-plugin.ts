import { GrowiThemeMetadata, HasObjectId } from '@growi/core';

export const GrowiPluginResourceType = {
  Template: 'template',
  Style: 'style',
  Theme: 'theme',
  Script: 'script',
} as const;
export type GrowiPluginResourceType = typeof GrowiPluginResourceType[keyof typeof GrowiPluginResourceType];

export type IGrowiPluginOrigin = {
  url: string,
  ghBranch?: string,
  ghTag?: string,
}

export type IGrowiPlugin<M extends IGrowiPluginMeta = IGrowiPluginMeta> = {
  isEnabled: boolean,
  installedPath: string,
  organizationName: string,
  origin: IGrowiPluginOrigin,
  meta: M,
}

export type IGrowiPluginMeta = {
  name: string,
  types: GrowiPluginResourceType[],
  desc?: string,
  author?: string,
}

export type IGrowiThemePluginMeta = IGrowiPluginMeta & {
  themes: GrowiThemeMetadata[]
}

export type IGrowiPluginHasId = IGrowiPlugin & HasObjectId;
