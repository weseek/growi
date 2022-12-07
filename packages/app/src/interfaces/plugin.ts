export const GrowiPluginResourceType = {
  Template: 'template',
  Style: 'style',
  Script: 'script',
} as const;
export type GrowiPluginResourceType = typeof GrowiPluginResourceType[keyof typeof GrowiPluginResourceType];

export type GrowiPluginOrigin = {
  url: string,
  ghBranch?: string,
  ghTag?: string,
}

export type GrowiPlugin = {
  isEnabled: boolean,
  installedPath: string,
  origin: GrowiPluginOrigin,
  meta: GrowiPluginMeta,
}

export type GrowiPluginMeta = {
  name: string,
  types: GrowiPluginResourceType[],
  desc?: string,
  author?: string,
}
