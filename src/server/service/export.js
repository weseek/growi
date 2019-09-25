const logger = require('@alias/logger')('growi:services:ExportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const streamToPromise = require('stream-to-promise');
const archiver = require('archiver');
const toArrayIfNot = require('../../lib/util/toArrayIfNot');

class ExportService {

  constructor(crowi) {
    this.crowi = crowi;
    this.appService = crowi.appService;
    this.growiBridgeService = crowi.growiBridgeService;
    this.baseDir = path.join(crowi.tmpDir, 'downloads');
    this.zipFileName = 'GROWI.zip';
    this.metaFileName = 'meta.json';
    this.encoding = 'utf-8';
    this.per = 100;
    this.zlibLevel = 9; // 0(min) - 9(max)

    // { pages: Page, users: User, ... }
    this.collectionMap = {};
    this.initCollectionMap(crowi.models);

    // this.files = {
    //   configs: path.join(this.baseDir, 'configs.json'),
    //   pages: path.join(this.baseDir, 'pages.json'),
    //   pagetagrelations: path.join(this.baseDir, 'pagetagrelations.json'),
    //   ...
    // };
    this.files = {};
    Object.values(crowi.models).forEach((m) => {
      const name = m.collection.collectionName;
      this.files[name] = path.join(this.baseDir, `${name}.json`);
    });
  }

  /**
   * initialize collection map
   *
   * @memberOf ExportService
   * @param {object} models from models/index.js
   */
  initCollectionMap(models) {
    for (const model of Object.values(models)) {
      this.collectionMap[model.collection.collectionName] = model;
    }
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
    const metaJson = path.join(this.baseDir, this.metaFileName);
    const writeStream = fs.createWriteStream(metaJson, { encoding: this.encoding });

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
   * @param {string} file path to json file to be written
   * @param {readStream} readStream  read stream
   * @param {number} [total] number of target items (optional)
   * @return {string} path to the exported json file
   */
  async export(file, readStream, total) {
    let n = 0;
    const ws = fs.createWriteStream(file, { encoding: this.encoding });

    // open an array
    ws.write('[');

    readStream.on('data', (chunk) => {
      if (n !== 0) ws.write(',');
      ws.write(JSON.stringify(chunk));
      n++;
      this.logProgress(n, total);
    });

    readStream.on('end', () => {
      // close the array
      ws.write(']');
      ws.close();
    });

    await streamToPromise(readStream);

    return file;
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
    const targetFile = this.files[collectionName];
    const total = await Model.countDocuments();
    const readStream = Model.find().cursor();

    const file = await this.export(targetFile, readStream, total);

    return file;
  }

  /**
   * export multiple collections
   *
   * @memberOf ExportService
   * @param {Array.<object>} models array of instances of mongoose model
   * @return {Array.<string>} paths to json files created
   */
  async exportMultipleCollectionsToJsons(models) {
    const jsonFiles = await Promise.all(models.map(Model => this.exportCollectionToJson(Model)));

    return jsonFiles;
  }

  /**
   * log export progress
   *
   * @memberOf ExportService
   * @param {number} n number of items exported
   * @param {number} [total] number of target items (optional)
   */
  logProgress(n, total) {
    let output;
    if (total) {
      output = `${n}/${total} written`;
    }
    else {
      output = `${n} items written`;
    }

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
    const zipFile = path.join(this.baseDir, this.zipFileName);
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

    logger.debug(`zipped growi data into ${zipFile} (${archive.pointer()} bytes)`);

    return zipFile;
  }

  /**
   * get the absolute path to a file
   *
   * @memberOf ExportService
   * @param {string} fileName base name of file
   * @return {string} absolute path to the file
   */
  getFile(fileName) {
    const jsonFile = path.join(this.baseDir, fileName);

    // throws err if the file does not exist
    fs.accessSync(jsonFile);

    return jsonFile;
  }

  /**
   * get a model from collection name
   *
   * @memberOf ExportService
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
   * remove zip file from downloads dir
   *
   * @param {string} zipFile absolute path to zip file
   * @memberOf ExportService
   */
  deleteZipFile(zipFile) {
    fs.unlinkSync(zipFile);
  }

}

module.exports = ExportService;
