const logger = require('@alias/logger')('growi:services:ExportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const streamToPromise = require('stream-to-promise');
const archiver = require('archiver');

class ExportService {

  constructor(crowi) {
    this.appService = crowi.appService;
    this.baseDir = path.join(crowi.tmpDir, 'downloads');
    this.encoding = 'utf-8';
    this.per = 100;
    this.zlibLevel = 9; // 0(min) - 9(max)

    // path to zip file for exporting multiple collection
    this.zipFile = path.join(this.baseDir, 'GROWI.zip');

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
   * dump a collection into json
   *
   * @memberOf ExportService
   * @return {object} cache info for exported zip files
   */
  getStatus() {
    const status = {};
    const collections = Object.keys(this.files);
    collections.forEach((file) => {
      status[path.basename(file, '.zip')] = null;
    });

    // extract ${collectionName}.zip
    const files = fs.readdirSync(this.baseDir).filter((file) => { return path.extname(file) === '.zip' && collections.includes(path.basename(file, '.zip')) });

    files.forEach((file) => {
      status[path.basename(file, '.zip')] = file;
    });

    files.forEach((file) => {
      const stats = fs.statSync(path.join(this.baseDir, file));
      stats.name = file;
      status[path.basename(file, '.zip')] = stats;
    });

    return status;
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
   * zip a file
   *
   * @memberOf ExportService
   * @param {string} from path to input file
   * @param {string} [to=`${path.join(path.dirname(from), `${path.basename(from, path.extname(from))}.zip`)}`] path to output file
   * @param {string} [as=path.basename(from)] file name after unzipped
   * @return {string} path to zip file
   * @see https://www.archiverjs.com/#quick-start
   */
  async zipSingleFile(from, to = this.replaceExtension(from, 'zip'), as = path.basename(from)) {
    const archive = archiver('zip', {
      zlib: { level: this.zlibLevel },
    });
    const input = fs.createReadStream(from);
    const output = fs.createWriteStream(to);

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') logger.error(err);
      else throw err;
    });

    // good practice to catch this error explicitly
    archive.on('error', (err) => { throw err });

    // append a file from stream
    archive.append(input, { name: as });

    // pipe archive data to the file
    archive.pipe(output);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();

    await streamToPromise(archive);

    logger.debug(`zipped ${from} into ${to} (${archive.pointer()} bytes)`);

    return to;
  }

  /**
   * zip a file
   *
   * @memberOf ExportService
   * @param {array} configs array of object { from: "path to source file", as: "file name appears after unzipped" }
   * @return {string} path to zip file
   */
  async zipMultipleFiles(configs) {
    const archive = archiver('zip', {
      zlib: { level: this.zlibLevel },
    });
    const output = fs.createWriteStream(this.zipFile);

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

    // pipe archive data to the file
    archive.pipe(output);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();

    await streamToPromise(archive);

    logger.debug(`zipped growi data into ${this.zipFile} (${archive.pointer()} bytes)`);

    return this.zipFile;
  }

  /**
   * replace a file extension
   *
   * @memberOf ExportService
   * @param {string} file file path
   * @param {string} extension new extension
   * @return {string} path to file with new extension
   */
  replaceExtension(file, extension) {
    return `${path.join(path.dirname(file), `${path.basename(file, path.extname(file))}.${extension}`)}`;
  }

  /**
   * get the path to the zipped file for a collection
   *
   * @memberOf ExportService
   * @param {object} Model instance of mongoose model
   * @return {string} path to zip file
   */
  getZipFile(Model) {
    const json = this.files[Model.collection.collectionName];
    const zip = this.replaceExtension(json, 'zip');
    if (!fs.existsSync(zip)) {
      throw new Error(`${zip} does not exist`);
    }

    return zip;
  }

  /**
   * get a model from collection name
   *
   * @memberOf ExportService
   * @param {object} collectionName collection name
   * @return {object} instance of mongoose model
   */
  getModelFromCollectionName(collectionName) {
    const Model = this.collectionMap[collectionName];

    if (Model == null) {
      throw new Error(`cannot find a model for collection name "${collectionName}"`);
    }

    return Model;
  }

}

module.exports = ExportService;
