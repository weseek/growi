import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';

import { GrowiPlugin, GrowiPluginMeta, GrowiPluginOrigin } from '~/interfaces/plugin';
import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';

// eslint-disable-next-line import/no-cycle
import Crowi from '../crowi';

const logger = loggerFactory('growi:plugins:plugin-utils');

const pluginStoringPath = resolveFromRoot('tmp/plugins');

export class PluginService {

  crowi: any;

  growiBridgeService: any;

  baseDir: any;

  getFile:any;

  constructor(crowi) {
    this.crowi = crowi;
    this.growiBridgeService = crowi.growiBridgeService;
    this.baseDir = path.join(crowi.tmpDir, 'plugins');
    this.getFile = this.growiBridgeService.getFile.bind(this);
  }

  async install(crowi: Crowi, origin: GrowiPluginOrigin): Promise<void> {
    // download
    const ghUrl = origin.url;
    const downloadDir = path.join(process.cwd(), 'tmp/plugins/');
    try {
      await this.downloadZipFile(`${ghUrl}/archive/refs/heads/master.zip`, downloadDir);
    }
    catch (err) {
      console.log('downloadZipFile error', err);
    }

    // save plugin metadata
    const ghRepositoryName = ghUrl.split('/').slice(-1)[0];
    const installedPath = path.join(downloadDir, `${ghRepositoryName}-main`);
    const plugins = await PluginService.detectPlugins(origin, installedPath);
    await this.savePluginMetaData(plugins);

    return;
  }

  async savePluginMetaData(plugins: GrowiPlugin[]): Promise<void> {
    const GrowiPlugin = mongoose.model('GrowiPlugin');
    await GrowiPlugin.insertMany(plugins);
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

  async downloadZipFile(ghUrl: string, filePath:string): Promise<void> {

    const stdout1 = execSync(`wget ${ghUrl} -O ${filePath}master.zip`);
    const stdout2 = execSync(`unzip ${filePath}master.zip -d ${filePath}`);
    const stdout3 = execSync(`rm ${filePath}master.zip`);

    return;
  }

}
