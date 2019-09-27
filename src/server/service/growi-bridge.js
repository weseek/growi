const logger = require('@alias/logger')('growi:services:ImportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const streamToPromise = require('stream-to-promise');
const unzipper = require('unzipper');

class GrowiBridgeService {

  constructor(crowi) {
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
      this.collectionMap[model.collection.collectionName] = model;
    }
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
   * @memberOf ImportService
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
    const readStream = fs.createReadStream(zipFile);
    const unzipStream = readStream.pipe(unzipper.Parse());
    const fileStats = [];
    let meta = {};

    unzipStream.on('entry', async(entry) => {
      const fileName = entry.path;
      const size = entry.vars.uncompressedSize; // There is also compressedSize;

      if (fileName === this.metaFileName) {
        meta = JSON.parse((await entry.buffer()).toString());
      }
      else {
        fileStats.push({
          fileName,
          collectionName: path.basename(fileName, '.json'),
          size,
        });
      }

      entry.autodrain();
    });

    await streamToPromise(unzipStream);

    return {
      meta,
      fileName: path.basename(zipFile),
      fileStats,
    };
  }

}

module.exports = GrowiBridgeService;
