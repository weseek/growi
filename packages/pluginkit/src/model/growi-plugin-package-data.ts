import { GrowiPluginType } from '@growi/core';

export type GrowiPluginDerective = {
  [key: string]: any,
  schemaVersion: number,
  types: GrowiPluginType[],
}

export type GrowiPluginPackageData = {
  [key: string]: any,
  growiPlugin: GrowiPluginDerective,
}
