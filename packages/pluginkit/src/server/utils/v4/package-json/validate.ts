import { GrowiPluginType } from '@growi/core/dist/consts';

import { type GrowiPluginValidationData, GrowiPluginValidationError } from '~/model';

import { importPackageJson } from './import';


export const validatePackageJson = async(projectDirRoot: string, expectedPluginType?: GrowiPluginType): Promise<GrowiPluginValidationData> => {
  const pkg = await importPackageJson(projectDirRoot);

  const data: GrowiPluginValidationData = { projectDirRoot };

  const { growiPlugin } = pkg;

  if (growiPlugin == null) {
    throw new GrowiPluginValidationError("The package.json does not have 'growiPlugin' directive.", data);
  }

  // schema version checking
  const schemaVersion = Number(growiPlugin.schemaVersion);
  data.schemaVersion = schemaVersion;
  if (Number.isNaN(schemaVersion) || schemaVersion < 4) {
    throw new GrowiPluginValidationError("The growiPlugin directive must have a valid 'schemaVersion' directive.", data);
  }

  const types: GrowiPluginType[] = growiPlugin.types;
  data.actualPluginTypes = types;
  if (types == null) {
    throw new GrowiPluginValidationError("The growiPlugin directive does not have 'types' directive.", data);
  }

  // type checking
  if (expectedPluginType != null) {
    data.expectedPluginType = expectedPluginType;

    if (!types.includes(expectedPluginType)) {
      throw new GrowiPluginValidationError("The growiPlugin directive does not have expected plugin type in 'types' directive.", data);
    }
  }

  return data;
};
