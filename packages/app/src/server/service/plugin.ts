
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import streamToPromise from 'stream-to-promise';
import unzipper from 'unzipper';

import { GrowiPlugin, GrowiPluginOrigin } from '~/interfaces/plugin';
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
      // TODO: error handling
    }

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

  sleep(waitMsec) {
    const startMsec = new Date();

    while (new Date() - startMsec < waitMsec);
  }

  async downloadZipFile(ghUrl: string, filePath:string): Promise<void> {

    console.log(`rm ${filePath}master.zip`);

    const stdout1 = execSync(`wget ${ghUrl} -O ${filePath}master.zip`);
    console.log(`wget ${ghUrl} -O ${filePath}master.zip`);
    console.log(`unzip ${filePath}master.zip -d ${filePath}`);
    this.sleep(5000);
    const stdout2 = execSync(`unzip ${filePath}master.zip -d ${filePath}`);
    console.log(`unzip ${filePath}master.zip -d ${filePath}`);
    const stdout3 = execSync(`rm ${filePath}master.zip`);

    // try {
    //   const zipFile = await this.getFile('master.zip');

    //   // await this.unzip('/workspace/growi/packages/app/tmp/plugins/master.zip');

    // }
    // catch (err) {
    //   console.log(err);
    // }
    return;
  }

  /**
   * extract a zip file
   *
   * @memberOf ImportService
   * @param {string} zipFile absolute path to zip file
   * @return {Array.<string>} array of absolute paths to extracted files
   */
  async unzip(zipFile) {
    // const stream = fs.createReadStream(zipFile).pipe(unzipper.Extract({ path: '/workspace/growi/packages/app/tmp/plugins/master' }));
    // try {
    //   await streamToPromise(stream);
    // }
    // catch (err) {
    //   console.log('err', err);
    // }
    const readStream = fs.createReadStream(zipFile);
    const unzipStream = readStream.pipe(unzipper.Parse());
    const files: any = [];


    unzipStream.on('entry', async(entry) => {
      const fileName = entry.path;
      // https://regex101.com/r/mD4eZs/6
      // prevent from unexpecting attack doing unzip file (path traversal attack)
      // FOR EXAMPLE
      // ../../src/server/views/admin/markdown.html
      if (fileName.match(/(\.\.\/|\.\.\\)/)) {
        logger.error('File path is not appropriate.', fileName);
        return;
      }

      if (fileName === this.growiBridgeService.getMetaFileName()) {
        // skip meta.json
        entry.autodrain();
      }
      else {
        const jsonFile = path.join(this.baseDir, fileName);
        const writeStream = fs.createWriteStream(jsonFile, { encoding: this.growiBridgeService.getEncoding() });
        entry.pipe(writeStream);
        files.push(jsonFile);
      }
    });

    await streamToPromise(unzipStream);

    return files;
  }

}
