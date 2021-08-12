export type PluginMetaV4 = {
  pluginSchemaVersion: number,
  serverEntries: string[],
  clientEntries: string[],
};

export type PluginDefinitionV4 = {
  name: string,
  meta: PluginMetaV4,
  entries: string[],
};
