import path from 'path';

export const importPackageJson = async(projectDirRoot: string): Promise<any> => {
  const packageJsonUrl = path.resolve(projectDirRoot, 'package.json');
  return import(packageJsonUrl);
};
