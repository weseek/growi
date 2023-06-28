import { GrowiPluginType } from '../consts/types';

export type GrowiPluginValidationData = {
  projectDirRoot: string,
  schemaVersion?: number,
  expectedPluginType?: GrowiPluginType,
  actualPluginTypes?: GrowiPluginType[],
};

export type GrowiTemplatePluginValidationData = GrowiPluginValidationData & {
  supportingLocales: string[],
}
