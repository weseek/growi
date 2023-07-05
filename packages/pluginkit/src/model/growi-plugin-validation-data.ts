import { GrowiPluginType } from '@growi/core/dist/consts';

import { GrowiPluginDerective } from './growi-plugin-package-data';

export type GrowiPluginValidationData = {
  projectDirRoot: string,
  growiPlugin: GrowiPluginDerective,
  schemaVersion: number,
  expectedPluginType?: GrowiPluginType,
  actualPluginTypes?: GrowiPluginType[],
};

export type GrowiTemplatePluginValidationData = GrowiPluginValidationData & {
  supportingLocales: string[],
}
