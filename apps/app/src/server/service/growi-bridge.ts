import fs from 'fs';
import path from 'path';

import unzipper from 'unzipper';

import loggerFactory from '~/utils/logger';

import { ZipFileStat } from './interfaces/export';

const streamToPromise = require('stream-to-promise');

const logger = loggerFactory('growi:services:GrowiBridgeService'); // eslint-disable-line no-unused-vars

/**
 * the service class for bridging GROWIs (export and import)
 * common properties and methods between export service and import service are defined in this service
 */
class GrowiBridgeService {

  crowi: any;

  encoding: BufferEncoding = 'utf-8';

  metaFileName = 'meta.json';

  baseDir: string | undefined;

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * getter for encoding
   *
   * @memberOf GrowiBridgeService
   * @return {BufferEncoding} encoding
   */
  getEncoding(): BufferEncoding {
    return this.encoding;
  }

  /**
   * getter for metaFileName
   *
   * @memberOf GrowiBridgeService
   * @return {string} base name of meta file
   */
  getMetaFileName(): string {
    return this.metaFileName;
  }

  /**
   * get a model from collection name
   *
   * @memberOf GrowiBridgeService
   * @param {string} collectionName collection name
   * @return {object} instance of mongoose model
   */
  getModelFromCollectionName(collectionName: string) {
    const Model = Object.values(this.crowi.models).find((m: any) => {
      return m.collection != null && m.collection.name === collectionName;
    });

    return Model;
  }

  /**
   * get the absolute path to a file
   * this method must must be bound to the caller (this.baseDir is undefined in this service)
   *
   * @memberOf GrowiBridgeService
   * @param {string} fileName base name of file
   * @return {string} absolute path to the file
   */
  getFile(fileName: string): string {
    if (this.baseDir == null) {
      throw new Error('baseDir is not defined');
    }

    const jsonFile = path.join(this.baseDir, fileName);

    // throws err if the file does not exist
    fs.accessSync(jsonFile);

    return jsonFile;
  }

  /**
   * parse a zip file
   *
   * @memberOf GrowiBridgeService
   * @param {string} zipFile path to zip file
   * @return {object} meta{object} and files{Array.<object>}
   */
  async parseZipFile(zipFile: string): Promise<ZipFileStat | null> {
    const fileStat = fs.statSync(zipFile);
    const innerFileStats: {fileName: string, collectionName: string, size: number}[] = [];
    let meta = {};

    const readStream = fs.createReadStream(zipFile);
    const unzipStream = readStream.pipe(unzipper.Parse());

    unzipStream.on('entry', async(entry) => {
      const fileName = entry.path;
      const size = entry.vars.uncompressedSize; // There is also compressedSize;

      if (fileName === this.getMetaFileName()) {
        meta = JSON.parse((await entry.buffer()).toString());
      }
      else {
        innerFileStats.push({
          fileName,
          collectionName: path.basename(fileName, '.json'),
          size,
        });
      }

      entry.autodrain();
    });

    try {
      await streamToPromise(unzipStream);
    }
    // if zip is broken
    catch (err) {
      logger.error(err);
      return null;
    }

    return {
      meta,
      fileName: path.basename(zipFile),
      zipFilePath: zipFile,
      fileStat,
      innerFileStats,
    };
  }

}

export default GrowiBridgeService;
