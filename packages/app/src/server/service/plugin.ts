import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';

import type { GrowiPlugin, GrowiPluginMeta, GrowiPluginOrigin } from '~/interfaces/plugin';
import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';

// eslint-disable-next-line import/no-cycle
import Crowi from '../crowi';

const logger = loggerFactory('growi:plugins:plugin-utils');

const pluginStoringPath = resolveFromRoot('tmp/plugins');

// https://regex101.com/r/fK2rV3/1
const githubReposIdPattern = new RegExp(/^\/([^/]+)\/([^/]+)$/);


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
    const ghUrl = new URL(origin.url);
    const ghPathname = ghUrl.pathname;

    const match = ghPathname.match(githubReposIdPattern);
    if (ghUrl.hostname !== 'github.com' || match == null) {
      throw new Error('The GitHub Repository URL is invalid.');
    }

    const ghOrganizationName = match[1];
    const ghReposName = match[2];

    try {
      await this.downloadZipFile(`${ghUrl.href}/archive/refs/heads/main.zip`, ghOrganizationName, ghReposName);
    }
    catch (err) {
      console.log('downloadZipFile error', err);
    }

    // save plugin metadata
    const installedPath = `${ghOrganizationName}/${ghReposName}`;
    const plugins = await PluginService.detectPlugins(origin, installedPath);
    await this.savePluginMetaData(plugins);

    return;
  }

  async downloadZipFile(url: string, ghOrganizationName: string, ghReposName: string): Promise<void> {

    const downloadTargetPath = pluginStoringPath;
    const zipFilePath = path.join(downloadTargetPath, 'main.zip');
    const unzipTargetPath = path.join(pluginStoringPath, ghOrganizationName);

    const stdout1 = execSync(`wget ${url} -O ${zipFilePath}`);
    const stdout2 = execSync(`mkdir -p ${ghOrganizationName}`);
    const stdout3 = execSync(`rm -rf ${ghOrganizationName}/${ghReposName}`);
    const stdout4 = execSync(`unzip ${zipFilePath} -d ${unzipTargetPath}`);
    const stdout5 = execSync(`mv ${unzipTargetPath}/${ghReposName}-main ${unzipTargetPath}/${ghReposName}`);
    const stdout6 = execSync(`rm ${zipFilePath}`);

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


}
