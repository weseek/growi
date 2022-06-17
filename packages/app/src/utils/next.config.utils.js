// workaround by https://github.com/martpie/next-transpile-modules/issues/143#issuecomment-817467144

const path = require('path')
const fs = require('fs')

const node_modules = path.resolve(__dirname, '../../../../node_modules')


export const listScopedPackages = (scopes) => {
  const scopedPackages = []

  fs.readdirSync(node_modules)
    .filter((name) => scopes.includes(name))
    .forEach((scope) => {
      fs.readdirSync(path.resolve(node_modules, scope))
        .filter((name) => !name.startsWith('.'))
        .forEach((folderName) => {
          const { name, ignoreTranspileModules } = require(path.resolve(
            node_modules,
            scope,
            folderName,
            'package.json'
          ))
          if (!ignoreTranspileModules) {
            scopedPackages.push(name)
          }
        })
    })

  return scopedPackages;
}
