const logger = require('@alias/logger')('growi:services:GrowiBridgeService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const streamToPromise = require('stream-to-promise');
const unzipper = require('unzipper');

/**
 * the service class for bridging GROWIs (export and import)
 * common properties and methods between export service and import service are defined in this service
 */
class GrowiBridgeService {

  constructor(crowi) {
    this.encoding = 'utf-8';
    this.metaFileName = 'meta.json';

    // { pages: Page, users: User, ... }
    this.collectionMap = {};
    this.initCollectionMap(crowi.models);
  }

  /**
   * initialize collection map
   *
   * @memberOf GrowiBridgeService
   * @param {object} models from models/index.js
   */
  initCollectionMap(models) {
    for (const model of Object.values(models)) {
      if (model.collection != null) {
        this.collectionMap[model.collection.name] = model;
      }
    }
  }

  /**
   * getter for encoding
   *
   * @memberOf GrowiBridgeService
   * @return {string} encoding
   */
  getEncoding() {
    return this.encoding;
  }

  /**
   * getter for metaFileName
   *
   * @memberOf GrowiBridgeService
   * @return {string} base name of meta file
   */
  getMetaFileName() {
    return this.metaFileName;
  }

  /**
   * get a model from collection name
   *
   * @memberOf GrowiBridgeService
   * @param {string} collectionName collection name
   * @return {object} instance of mongoose model
   */
  getModelFromCollectionName(collectionName) {
    const Model = this.collectionMap[collectionName];

    if (Model == null) {
      throw new Error(`cannot find a model for collection name "${collectionName}"`);
    }

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
  getFile(fileName) {
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
  async parseZipFile(zipFile) {
    const fileStat = fs.statSync(zipFile);
    const innerFileStats = [];
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
      fileStat,
      innerFileStats,
    };
  }

}

module.exports = GrowiBridgeService;
