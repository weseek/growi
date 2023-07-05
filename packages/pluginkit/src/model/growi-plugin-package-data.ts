import { GrowiPluginType } from '@growi/core';

export type GrowiPluginDirective = {
  [key: string]: any,
  schemaVersion: number,
  types: GrowiPluginType[],
}

export type GrowiPluginPackageData = {
  [key: string]: any,
  growiPlugin: GrowiPluginDirective,
}
