import path from 'path';

import { GrowiPluginType } from '../../../consts/types';
import type { GrowiPluginValidationData } from '../../../model/growi-plugin-validation-data';
import { GrowiPluginValidationError } from '../../../model/growi-plugin-validation-error';


export const importPackageJson = async(projectDirRoot: string): Promise<any> => {
  const packageJsonUrl = path.resolve(projectDirRoot, 'package.json');
  return import(packageJsonUrl);
};

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
      throw new GrowiPluginValidationError("The growiPlugin directive does not have 'types' directive.", data);
    }
  }

  return data;
};
