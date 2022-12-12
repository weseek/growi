import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';
import request from 'superagent';
import unzipper from 'unzipper';

import { ActivatePluginService, GrowiPluginManifestEntries } from '~/client/services/activate-plugin';
import type { GrowiPlugin, GrowiPluginOrigin } from '~/interfaces/plugin';
import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';


const logger = loggerFactory('growi:plugins:plugin-utils');

const pluginStoringPath = resolveFromRoot('tmp/plugins');

// https://regex101.com/r/fK2rV3/1
const githubReposIdPattern = new RegExp(/^\/([^/]+)\/([^/]+)$/);


export class PluginService {

  async install(origin: GrowiPluginOrigin): Promise<void> {
    // download
    const ghUrl = new URL(origin.url);
    const ghPathname = ghUrl.pathname;

    const match = ghPathname.match(githubReposIdPattern);
    if (ghUrl.hostname !== 'github.com' || match == null) {
      throw new Error('The GitHub Repository URL is invalid.');
    }

    const ghOrganizationName = match[1];
    const ghReposName = match[2];
    const requestUrl = `https://github.com/${ghOrganizationName}/${ghReposName}/archive/refs/heads/main.zip`;

    // download github repository to local file system
    await this.download(requestUrl, ghOrganizationName, ghReposName);

    // save plugin metadata
    const installedPath = `${ghOrganizationName}/${ghReposName}`;
    const plugins = await PluginService.detectPlugins(origin, installedPath);
    await this.savePluginMetaData(plugins);


    return;
  }

  async download(url: string, ghOrganizationName: string, ghReposName: string): Promise<void> {

    const zipFilePath = path.join(pluginStoringPath, 'main.zip');
    const unzippedPath = path.join(pluginStoringPath, ghOrganizationName);

    const downloadZipFile = () => {
      const writeStream = fs.createWriteStream(zipFilePath);

      return new Promise<void>((resolve, reject) => {
        request
          .get(url)
          .pipe(writeStream)
          .on('close', () => writeStream.close())
          .on('finish', () => resolve())
          .on('error', (error: any) => reject(error));
      });
    };

    const unzip = () => {
      const stream = fs.createReadStream(zipFilePath);
      const deleteZipFile = (path: fs.PathLike) => {
        fs.unlink(path, (err) => {
          if (err) throw err;
        });
      };

      return new Promise<void>((resolve, reject) => {
        stream.pipe(unzipper.Extract({ path: unzippedPath }))
          .on('finish', () => {
            deleteZipFile(zipFilePath);
            resolve();
          })
          .on('error', (error: any) => reject(error));
      });
    };

    const renameUnzipFolderPath = async() => {
      const oldPath = `${unzippedPath}/${ghReposName}-main`;
      const newPath = `${unzippedPath}/${ghReposName}`;

      fs.renameSync(oldPath, newPath);
    };

    await downloadZipFile();
    await unzip();
    await renameUnzipFolderPath();

    return;
  }

  async savePluginMetaData(plugins: GrowiPlugin[]): Promise<void> {
    const GrowiPlugin = mongoose.model('GrowiPlugin');
    await GrowiPlugin.insertMany(plugins);
  }

  async getPlugins(): Promise<any> {
    const GrowiPlugin = mongoose.model<GrowiPlugin>('GrowiPlugin');
    const growiPlugins = await GrowiPlugin.find({});
    const pluginManifestEntries: GrowiPluginManifestEntries = await ActivatePluginService.retrievePluginManifests(growiPlugins);
    return JSON.parse(JSON.stringify(pluginManifestEntries));
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

  /**
   * Get plugin isEnabled
   */
  async getPluginIsEnabled(targetPluginId: string): Promise<any> {
    const GrowiPlugin = await mongoose.model<GrowiPlugin>('GrowiPlugin');
    const growiPlugins = await GrowiPlugin.find({ _id: targetPluginId });
    return growiPlugins[0].isEnabled;
  }

  /**
   * Switch plugin enabled
   */
  async switchPluginIsEnabled(targetPluginId: string): Promise<any> {
    const GrowiPlugin = mongoose.model<GrowiPlugin>('GrowiPlugin');
    const growiPlugins = await GrowiPlugin.find({ _id: targetPluginId });
    await growiPlugins[0].update(
      { isEnabled: !growiPlugins[0].isEnabled },
    );
    return growiPlugins[0].isEnabled;
  }

  /**
   * Delete plugin
   */
  async pluginDeleted(targetPluginId: string, targetPluginName: string): Promise<any> {
    const GrowiPlugin = mongoose.model<GrowiPlugin>('GrowiPlugin');
    const growiPlugins = await GrowiPlugin.find({ _id: targetPluginId });
    growiPlugins[0].remove();
    // TODO: Check remove
    const ghOrganizationName = 'weseek';
    const unzipTargetPath = path.join(pluginStoringPath, ghOrganizationName);
    execSync(`rm -rf ${unzipTargetPath}/${targetPluginName}`);
    return [];
  }

}
