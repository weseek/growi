// workaround by https://github.com/martpie/next-transpile-modules/issues/143#issuecomment-817467144

import fs from 'fs';
import path from 'path';

const nodeModulesPath = path.resolve(__dirname, '../../../../node_modules');

type Opts = {
  ignorePackageNames: string[],
}

const defaultOpts: Opts = { ignorePackageNames: [] };

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const listScopedPackages = (scopes: string[], opts = defaultOpts) => {
  const scopedPackages: string[] = [];

  fs.readdirSync(nodeModulesPath)
    .filter(name => scopes.includes(name))
    .forEach((scope) => {
      fs.readdirSync(path.resolve(nodeModulesPath, scope))
        .filter(name => !name.startsWith('.'))
        .forEach((folderName) => {
          const { name } = require(path.resolve(
            nodeModulesPath,
            scope,
            folderName,
            'package.json',
          ));
          if (!opts.ignorePackageNames.includes(name)) {
            scopedPackages.push(name);
          }
        });
    });

  return scopedPackages;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const listPrefixedPackages = (prefixes: string[], opts = defaultOpts) => {
  const prefixedPackages: string[] = [];

  fs.readdirSync(nodeModulesPath)
    .filter(name => prefixes.some(prefix => name.startsWith(prefix)))
    .filter(name => !name.startsWith('.'))
    .forEach((folderName) => {
      const { name } = require(path.resolve(
        nodeModulesPath,
        folderName,
        'package.json',
      ));
      if (!opts.ignorePackageNames.includes(name)) {
        prefixedPackages.push(name);
      }
    });

  return prefixedPackages;
};
