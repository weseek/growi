
import fs from 'fs';
import path from 'path';

// eslint-disable-next-line no-restricted-imports
import axios from 'axios';
import ObjectID from 'bson-objectid';
import mongoose from 'mongoose';
import streamToPromise from 'stream-to-promise';
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
    // TODO: Branch names can be specified.
    const ghBranch = 'main';

    const match = ghPathname.match(githubReposIdPattern);
    if (ghUrl.hostname !== 'github.com' || match == null) {
      throw new Error('The GitHub Repository URL is invalid.');
    }

    const ghOrganizationName = match[1];
    const ghReposName = match[2];
    const requestUrl = `https://github.com/${ghOrganizationName}/${ghReposName}/archive/refs/heads/${ghBranch}.zip`;

    // download github repository to local file system
    await this.download(requestUrl, ghOrganizationName, ghReposName, ghBranch);

    // save plugin metadata
    const installedPath = `${ghOrganizationName}/${ghReposName}`;
    const plugins = await PluginService.detectPlugins(origin, installedPath);
    await this.savePluginMetaData(plugins);

    return;
  }

  async download(requestUrl: string, ghOrganizationName: string, ghReposName: string, ghBranch: string): Promise<void> {

    const zipFilePath = path.join(pluginStoringPath, `${ghBranch}.zip`);
    const unzippedPath = path.join(pluginStoringPath, ghOrganizationName);

    const renamePath = async(oldPath: fs.PathLike, newPath: fs.PathLike) => {
      fs.renameSync(oldPath, newPath);
    };

    const downloadFile = async(requestUrl: string, filePath: string) => {
      return new Promise<void>((resolve, reject) => {
        axios({
          method: 'GET',
          url: requestUrl,
          responseType: 'stream',
        })
          .then((res) => {
            if (res.status === 200) {
              const file = fs.createWriteStream(filePath);
              res.data.pipe(file)
                .on('close', () => file.close())
                .on('finish', () => {
                  return resolve();
                });
            }
            else {
              return reject(res.status);
            }
          }).catch((err) => {
            return reject(err);
          });
      });
    };

    const unzip = async(zipFilePath: fs.PathLike, unzippedPath: fs.PathLike) => {
      const stream = fs.createReadStream(zipFilePath);
      const unzipStream = stream.pipe(unzipper.Extract({ path: unzippedPath }));
      const deleteZipFile = (path: fs.PathLike) => fs.unlink(path, (err) => { return err });

      try {
        await streamToPromise(unzipStream);
        deleteZipFile(zipFilePath);
      }
      catch (err) {
        return err;
      }
    };

    try {
      await downloadFile(requestUrl, zipFilePath);
      await unzip(zipFilePath, unzippedPath);
      await renamePath(`${unzippedPath}/${ghReposName}-${ghBranch}`, `${unzippedPath}/${ghReposName}`);
    }
    catch (err) {
      logger.error(err);
      throw new Error(err);
    }

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
  async getPluginIsEnabled(targetPluginId: string): Promise<boolean> {
    const ObjectID = mongoose.Types.ObjectId;
    const isValidObjectId = (id) => {
      return ObjectID.isValid(id) && (new ObjectID(id).toString() === id);
    };

    if (isValidObjectId(targetPluginId)) {
      const GrowiPlugin = mongoose.model<GrowiPlugin>('GrowiPlugin');
      const growiPlugins = await GrowiPlugin.find({ _id: new ObjectID(targetPluginId).toString() });
      return growiPlugins[0].isEnabled;
    }

    throw new Error('Invalid id');
  }

  /**
   * Switch plugin enabled
   */
  async switchPluginIsEnabled(targetPluginId: string): Promise<boolean> {
    const ObjectID = mongoose.Types.ObjectId;
    const isValidObjectId = (id) => {
      return ObjectID.isValid(id) && (new ObjectID(id).toString() === id);
    };

    if (isValidObjectId(targetPluginId)) {
      const GrowiPlugin = mongoose.model<GrowiPlugin>('GrowiPlugin');
      const growiPlugins = await GrowiPlugin.find({ _id: new ObjectID(targetPluginId).toString() });
      await growiPlugins[0].update(
        { isEnabled: !growiPlugins[0].isEnabled },
      );
      return growiPlugins[0].isEnabled;
    }

    throw new Error('Invalid id');
  }

  /**
   * Delete plugin
   */
  async pluginDeleted(targetPluginId: string): Promise<void> {
    const ObjectID = mongoose.Types.ObjectId;
    const isValidObjectId = (id) => {
      return ObjectID.isValid(id) && (new ObjectID(id).toString() === id);
    };

    if (isValidObjectId(targetPluginId)) {
      const GrowiPlugin = mongoose.model<GrowiPlugin>('GrowiPlugin');
      const growiPlugins = await GrowiPlugin.find({ _id: new ObjectID(targetPluginId).toString() });
      growiPlugins[0].remove();
      const deleteZipFile = (path: fs.PathLike) => fs.unlink(path, (err) => { return err });
      deleteZipFile(growiPlugins[0].installedPath);
      return;
    }

    throw new Error('Invalid id');
  }

}
