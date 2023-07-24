import { GrowiPluginType } from '@growi/core/dist/consts';

import { GrowiPluginDirective } from './growi-plugin-package-data';

export type GrowiPluginValidationData = {
  projectDirRoot: string,
  growiPlugin: GrowiPluginDirective,
  schemaVersion: number,
  expectedPluginType?: GrowiPluginType,
  actualPluginTypes?: GrowiPluginType[],
};

export type GrowiTemplatePluginValidationData = GrowiPluginValidationData & {
  supportingLocales: string[],
}
