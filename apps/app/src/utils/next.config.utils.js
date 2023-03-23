// workaround by https://github.com/martpie/next-transpile-modules/issues/143#issuecomment-817467144

const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.resolve(__dirname, '../../../../node_modules');

/**
 * @typedef { { ignorePackageNames: string[] } } Opts
 */

/** @type {Opts} */
const defaultOpts = { ignorePackageNames: [] };

/**
 * @param scopes {string[]}
 */
exports.listScopedPackages = (scopes, opts = defaultOpts) => {
  /** @type {string[]} */
  const scopedPackages = [];

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

/**
 * @param prefixes {string[]}
 */
exports.listPrefixedPackages = (prefixes, opts = defaultOpts) => {
  /** @type {string[]} */
  const prefixedPackages = [];

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
