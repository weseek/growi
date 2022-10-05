
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

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static async detectPlugins(origin: GrowiPluginOrigin, installedPath: string, parentPackageJson?: any): Promise<GrowiPlugin[]> {
    const packageJsonPath = path.resolve(pluginStoringPath, installedPath, 'package.json');
    const packageJson = await import(packageJsonPath);

    const { growiPlugin } = packageJson;
    const {
      name: packageName, description: packageDesc, author: packageAuthor,
    } = parentPackageJson ?? packageJson;


    if (growiPlugin == null) {
      throw new Error('This package does not include \'growiPlugin\' section.');
    }

    // detect sub plugins for monorepo
    if (growiPlugin.isMonorepo && growiPlugin.packages != null) {
      const plugins = await Promise.all(
        growiPlugin.packages.map(async(subPackagePath) => {
          const subPackageInstalledPath = path.join(installedPath, subPackagePath);
          return this.detectPlugins(origin, subPackageInstalledPath, packageJson);
        }),
      );
      return plugins.flat();
    }

    if (growiPlugin.types == null) {
      throw new Error('\'growiPlugin\' section must have a \'types\' property.');
    }

    const plugin = {
      isEnabled: true,
      installedPath,
      origin,
      meta: {
        name: growiPlugin.name ?? packageName,
        desc: growiPlugin.desc ?? packageDesc,
        author: growiPlugin.author ?? packageAuthor,
        types: growiPlugin.types,
      },
    };

    logger.info('Plugin detected => ', plugin);

    return [plugin];
  }


  async listPlugins(): Promise<GrowiPlugin[]> {
    return [];
  }

}
