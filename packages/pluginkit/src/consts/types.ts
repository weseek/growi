export const GrowiPluginType = {
  SCRIPT: 'script',
  TEMPLATE: 'template',
  THEME: 'theme',
} as const;
export type GrowiPluginType = typeof GrowiPluginType[keyof typeof GrowiPluginType];
