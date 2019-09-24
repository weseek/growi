const logger = require('@alias/logger')('growi:services:ImportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const streamToPromise = require('stream-to-promise');
const unzipper = require('unzipper');

class GrowiBridgeService {

  constructor(crowi) {
    this.metaFileName = 'meta.json';
  }

  /**
   * parse a zip file
   *
   * @memberOf ImportService
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
