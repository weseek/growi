export const GrowiPluginResourceType = {
  Template: 'Template',
  Style: 'Style',
  Script: 'Script',
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
  type: GrowiPluginResourceType[],
  author?: string,
}
