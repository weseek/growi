
import path from 'path';

import wget from 'node-wget-js';

import { GrowiPlugin, GrowiPluginOrigin } from '~/interfaces/plugin';
import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';

// eslint-disable-next-line import/no-cycle
import Crowi from '../crowi';

const logger = loggerFactory('growi:plugins:plugin-utils');

const pluginStoringPath = resolveFromRoot('tmp/plugins');

async function downloadZipFile(ghUrl: string, filename:string, crowi): Promise<void> {
  const { importService } = crowi;
  wget({ url: ghUrl, dest: filename });
  try {
    console.log('j;oif', `${filename}master.zip`);
    const zipFile = await importService.getFile('master.zip');
    console.log('zip');
    const file = await importService.unzip(zipFile);
    console.log('fixl', file);
  }
  catch (err) {
    console.log('fail');
  }
  return;
}
export class PluginService {

  async install(crowi: Crowi, origin: GrowiPluginOrigin): Promise<void> {
    // download
    const ghUrl = origin.url;
    const downloadDir = path.join(process.cwd(), 'tmp/plugins/');
    await downloadZipFile(`${ghUrl}/archive/refs/heads/master.zip`, downloadDir, crowi);

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
