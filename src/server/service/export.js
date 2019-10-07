const logger = require('@alias/logger')('growi:services:ExportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const streamToPromise = require('stream-to-promise');
const archiver = require('archiver');
const toArrayIfNot = require('../../lib/util/toArrayIfNot');

class ExportService {

  constructor(crowi) {
    this.crowi = crowi;
    this.appService = crowi.appService;
    this.growiBridgeService = crowi.growiBridgeService;
    this.getFile = this.growiBridgeService.getFile.bind(this);
    this.baseDir = path.join(crowi.tmpDir, 'downloads');
    this.per = 100;
    this.zlibLevel = 9; // 0(min) - 9(max)
  }

  /**
   * parse all zip files in downloads dir
   *
   * @memberOf ExportService
   * @return {Array.<object>} info for zip files
   */
  async getStatus() {
    const zipFiles = fs.readdirSync(this.baseDir).filter((file) => { return path.extname(file) === '.zip' });
    const zipFileStats = await Promise.all(zipFiles.map((file) => {
      const zipFile = this.getFile(file);
      return this.growiBridgeService.parseZipFile(zipFile);
    }));

    return zipFileStats;
  }

  /**
   * create meta.json
   *
   * @memberOf ExportService
   * @return {string} path to meta.json
   */
  async createMetaJson() {
    const metaJson = path.join(this.baseDir, this.growiBridgeService.getMetaFileName());
    const writeStream = fs.createWriteStream(metaJson, { encoding: this.growiBridgeService.getEncoding() });

    const metaData = {
      version: this.crowi.version,
      url: this.appService.getSiteUrl(),
      passwordSeed: this.crowi.env.PASSWORD_SEED,
      exportedAt: new Date(),
    };

    writeStream.write(JSON.stringify(metaData));
    writeStream.close();

    await streamToPromise(writeStream);

    return metaJson;
  }

  /**
   * dump a collection into json
   *
   * @memberOf ExportService
   * @param {WritableStream} writeStream write stream
   * @param {ReadableStream} readStream read stream (chunks should be stringified)
   * @param {number} total number of target items (optional)
   * @param {function} [getLogText] (n, total) => { ... }
   * @return {string} path to the exported json file
   */
  generateTransformStream(total, getLogText) {
    let n = 0;

    const logProgress = this.logProgress.bind(this);
    return new Transform({
      // highWaterMark: 16 * 1024 * 1024,
      transform(chunk, encoding, callback) {
        // write beginning brace
        if (n === 0) {
          this.push('[');
        }
        // write separator
        else {
          this.push(',');
        }

        this.push(chunk);

        n++;
        logProgress(n, total, getLogText);

        callback();
      },
      final(callback) {
        // write ending brace
        this.push(']');
        callback();
      },
    });
  }

  /**
   * dump a mongodb collection into json
   *
   * @memberOf ExportService
   * @param {object} Model instance of mongoose model
   * @return {string} path to zip file
   */
  async exportCollectionToJson(Model) {
    const { collectionName } = Model.collection;

    // get native Cursor instance
    //  cz: Mongoose cursor might cause memory leak
    const nativeCursor = Model.collection.find();
    const readStream = nativeCursor
      .snapshot()
      // .batchSize(10)
      .stream({
        // highWaterMark: 16 * 1024 * 1024,
        transform: JSON.stringify,
      });

    // get TransformStream
    const total = await Model.countDocuments();
    const getLogText = (n, total) => `${collectionName}: ${n}/${total} written`;
    const transformStream = this.generateTransformStream(total, getLogText);

    // create WritableStream
    const jsonFileToWrite = path.join(this.baseDir, `${collectionName}.json`);
    const writeStream = fs.createWriteStream(jsonFileToWrite, { encoding: this.growiBridgeService.getEncoding() });

    readStream
      .pipe(transformStream)
      .pipe(writeStream);

    await streamToPromise(readStream);

    return writeStream.path;
  }

  /**
   * export multiple Collections into json and Zip
   *
   * @memberOf ExportService
   * @param {Array.<object>} models array of instances of mongoose model
   * @return {Array.<string>} paths to json files created
   */
  async exportCollectionsToZippedJson(models) {
    const metaJson = await this.createMetaJson();

    const promisesForModels = models.map(Model => this.exportCollectionToJson(Model));
    const jsonFiles = await Promise.all(promisesForModels);

    // zip json
    const configs = jsonFiles.map((jsonFile) => { return { from: jsonFile, as: path.basename(jsonFile) } });
    // add meta.json in zip
    configs.push({ from: metaJson, as: path.basename(metaJson) });
    // exec zip
    const zipFile = await this.zipFiles(configs);

    // get stats for the zip file
    return this.growiBridgeService.parseZipFile(zipFile);
  }

  /**
   * log export progress
   *
   * @memberOf ExportService
   * @param {number} n number of items exported
   * @param {number} total number of target items (optional)
   * @param {function} [getLogText] (n, total) => { ... }
   */
  logProgress(n, total, getLogText) {
    const output = getLogText ? getLogText(n, total) : `${n}/${total} items written`;

    // output every this.per items
    if (n % this.per === 0) logger.debug(output);
    // output last item
    else if (n === total) logger.info(output);
  }

  /**
   * zip files into one zip file
   *
   * @memberOf ExportService
   * @param {object|array<object>} configs object or array of object { from: "path to source file", as: "file name after unzipped" }
   * @return {string} absolute path to the zip file
   * @see https://www.archiverjs.com/#quick-start
   */
  async zipFiles(_configs) {
    const configs = toArrayIfNot(_configs);
    const appTitle = this.appService.getAppTitle();
    const timeStamp = (new Date()).getTime();
    const zipFile = path.join(this.baseDir, `${appTitle}-${timeStamp}.zip`);
    const archive = archiver('zip', {
      zlib: { level: this.zlibLevel },
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') logger.error(err);
      else throw err;
    });

    // good practice to catch this error explicitly
    archive.on('error', (err) => { throw err });

    for (const { from, as } of configs) {
      const input = fs.createReadStream(from);

      // append a file from stream
      archive.append(input, { name: as });
    }

    const output = fs.createWriteStream(zipFile);

    // pipe archive data to the file
    archive.pipe(output);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();

    await streamToPromise(archive);

    logger.info(`zipped growi data into ${zipFile} (${archive.pointer()} bytes)`);

    // delete json files
    for (const { from } of configs) {
      fs.unlinkSync(from);
    }

    return zipFile;
  }

}

module.exports = ExportService;
