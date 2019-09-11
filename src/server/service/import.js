const logger = require('@alias/logger')('growi:services:ImportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const streamToPromise = require('stream-to-promise');

class ImportService {

  constructor(crowi) {
    this.baseDir = path.join(crowi.tmpDir, 'downloads');
    this.extension = 'json';
    this.encoding = 'utf-8';
    this.per = 100;
    this.zlibLevel = 9; // 0(min) - 9(max)
  }


  /**
   * import a collection from json
   *
   * @memberOf ImportService
   * @param {object} Model instance of mongoose model
   * @param {string} filePath path to zipped json
   */
  async importFromZip(Model, filePath) {
    console.log(Model.collection.collectionName);
    console.log(filePath);
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(path.join(this.baseDir, 'test.json'));
    readStream.on('data', (data) => { console.log(data); writeStream.write(data); writeStream.write('---------------'); console.log('---------------') });
  }

}

module.exports = ImportService;
