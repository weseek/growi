import { GrowiPluginType } from '@growi/core/dist/consts';

export type GrowiPluginValidationData = {
  projectDirRoot: string,
  schemaVersion?: number,
  expectedPluginType?: GrowiPluginType,
  actualPluginTypes?: GrowiPluginType[],
};

export type GrowiTemplatePluginValidationData = GrowiPluginValidationData & {
  supportingLocales: string[],
}
