
import path from 'path';

import wget from 'node-wget-js';

import { GrowiPlugin, GrowiPluginOrigin } from '~/interfaces/plugin';
import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';

// eslint-disable-next-line import/no-cycle
import Crowi from '../crowi';

const logger = loggerFactory('growi:plugins:plugin-utils');

const pluginStoringPath = resolveFromRoot('tmp/plugins');

function downloadZipFile(ghUrl: string, filename:string): void {
  wget({ url: ghUrl, dest: filename });
  return;
}

export class PluginService {

  static async install(crowi: Crowi, origin: GrowiPluginOrigin): Promise<void> {
    // const { importServic } = crowi;
    // download
    const ghUrl = origin.url;
    // const ghBranch = origin.ghBranch;
    // const ghTag = origin.ghTag;
    const downloadDir = path.join(process.cwd(), 'tmp/plugins/');
    downloadZipFile(`${ghUrl}/archive/refs/heads/master.zip`, downloadDir);
    // const test = '/workspace/growi/packages/app/tmp/plugins/master.zip';
    // const file = unzip();
    // // unzip
    // const files = await unzip(`${downloadDir}master.zip`);
    // console.log('fle', files);
    // const file = await importService.unzip(`${downloadDir}master.zip`);
    // console.log(file);
    // try {
    //   // unzip
    //   const file = await importService.unzip(zipFile);
    //   console.log('fle', file)
    // }
    // catch (err) {
    //   // TODO:
    // }

    // TODO: detect plugins
    // TODO: save documents
    return;
  }

  static detectPlugins(origin: GrowiPluginOrigin, installedPath: string): GrowiPlugin[] {
    // const plugins: GrowiPlugin[] = [];

    // const package = require(path.resolve(installedPath, 'package.json'));

    // return scopedPackages;
  }

  // /**
  //  * list plugin module objects
  //  *  that starts with 'growi-plugin-' or 'crowi-plugin-'
  //  * borrowing from: https://github.com/hexojs/hexo/blob/d1db459c92a4765620343b95789361cbbc6414c5/lib/hexo/load_plugins.js#L17
  //  *
  //  * @returns array of objects
  //  *   [
  //  *     { name: 'growi-plugin-...', requiredVersion: '^1.0.0', installedVersion: '1.0.0' },
  //  *     { name: 'growi-plugin-...', requiredVersion: '^1.0.0', installedVersion: '1.0.0' },
  //  *     ...
  //  *   ]
  //  *
  //  * @memberOf PluginService
  //  */
  // listPlugins() {
  //   const packagePath = resolveFromRoot('package.json');

  //   // Make sure package.json exists
  //   if (!fs.existsSync(packagePath)) {
  //     return [];
  //   }

  //   // Read package.json and find dependencies
  //   const content = fs.readFileSync(packagePath);
  //   const json = JSON.parse(content);
  //   const deps = json.dependencies || {};

  //   const pluginNames = Object.keys(deps).filter((name) => {
  //     return /^@growi\/plugin-/.test(name);
  //   });

  //   return pluginNames.map((name) => {
  //     return {
  //       name,
  //       requiredVersion: deps[name],
  //       installedVersion: this.getVersion(name),
  //     };
  //   });
  // }

  // /**
  //  * list plugin module names that starts with 'crowi-plugin-'
  //  *
  //  * @returns array of plugin names
  //  *
  //  * @memberOf PluginService
  //  */
  // listPluginNames() {
  //   const plugins = this.listPlugins();
  //   return plugins.map((plugin) => { return plugin.name });
  // }

  // getVersion(packageName) {
  //   const packagePath = resolveFromRoot(`../../node_modules/${packageName}/package.json`);

  //   // Read package.json and find version
  //   const content = fs.readFileSync(packagePath);
  //   const json = JSON.parse(content);
  //   return json.version || '';
  // }

}
