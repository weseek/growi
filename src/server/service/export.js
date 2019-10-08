const logger = require('@alias/logger')('growi:services:ExportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const streamToPromise = require('stream-to-promise');
const archiver = require('archiver');
const toArrayIfNot = require('../../lib/util/toArrayIfNot');


class ExportingProgress {

  constructor(collectionName, totalCount) {
    this.collectionName = collectionName;
    this.currentCount = 0;
    this.totalCount = totalCount;
  }

}

class ExportStatus {

  constructor() {
    this.totalCount = 0;

    this.progressList = null;
    this.progressMap = {};
  }

  async init(models) {
    const promisesForCreatingInstance = models.map(async(Model) => {
      const collectionName = Model.collection.name;
      const totalCount = await Model.countDocuments();
      return new ExportingProgress(collectionName, totalCount);
    });
    this.progressList = await Promise.all(promisesForCreatingInstance);

    // collection name to instance mapping
    this.progressList.forEach((p) => {
      this.progressMap[p.collectionName] = p;
      this.totalCount += p.totalCount;
    });
  }

  get currentCount() {
    return this.progressList.reduce(
      (acc, crr) => acc + crr.currentCount,
      0,
    );
  }

}


class ExportService {

  constructor(crowi) {
    this.crowi = crowi;
    this.appService = crowi.appService;
    this.growiBridgeService = crowi.growiBridgeService;
    this.getFile = this.growiBridgeService.getFile.bind(this);
    this.baseDir = path.join(crowi.tmpDir, 'downloads');
    this.per = 100;
    this.zlibLevel = 9; // 0(min) - 9(max)

    this.adminEvent = crowi.event('admin');
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

    // filter null object (broken zip)
    const filtered = zipFileStats.filter(element => element != null);

    return filtered;
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
   *
   * @param {ExportStatus} exportStatus
   * @param {ExportProguress} exportProgress
   * @return {Transform}
   */
  generateLogStream(exportStatus, exportProgress) {
    const logProgress = this.logProgress.bind(this);

    let count = 0;

    return new Transform({
      transform(chunk, encoding, callback) {
        count++;
        logProgress(exportStatus, exportProgress, count);

        this.push(chunk);

        callback();
      },
    });
  }

  /**
   * insert beginning/ending brackets and comma separator for Json Array
   *
   * @memberOf ExportService
   * @return {TransformStream}
   */
  generateTransformStream() {
    let isFirst = true;

    const transformStream = new Transform({
      transform(chunk, encoding, callback) {
        // write beginning brace
        if (isFirst) {
          this.push('[');
          isFirst = false;
        }
        // write separator
        else {
          this.push(',');
        }

        this.push(chunk);
        callback();
      },
      final(callback) {
        // write ending brace
        this.push(']');
        callback();
      },
    });

    return transformStream;
  }

  /**
   * dump a mongodb collection into json
   *
   * @memberOf ExportService
   * @param {ExportStatus} exportStatus
   * @param {object} Model instance of mongoose model
   * @return {string} path to zip file
   */
  async exportCollectionToJson(exportStatus, Model) {
    const collectionName = Model.collection.name;

    // get native Cursor instance
    //  cz: Mongoose cursor might cause memory leak
    const nativeCursor = Model.collection.find();
    const readStream = nativeCursor
      .snapshot()
      .stream({ transform: JSON.stringify });

    // get TransformStream
    const transformStream = this.generateTransformStream();

    // log configuration
    const exportProgress = exportStatus.progressMap[collectionName];
    const logStream = this.generateLogStream(exportStatus, exportProgress);

    // create WritableStream
    const jsonFileToWrite = path.join(this.baseDir, `${collectionName}.json`);
    const writeStream = fs.createWriteStream(jsonFileToWrite, { encoding: this.growiBridgeService.getEncoding() });

    readStream
      .pipe(logStream)
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

    const exportStatus = new ExportStatus();
    await exportStatus.init(models);

    const promisesForModels = models.map(Model => this.exportCollectionToJson(exportStatus, Model));
    const jsonFiles = await Promise.all(promisesForModels);

    // zip json
    const configs = jsonFiles.map((jsonFile) => { return { from: jsonFile, as: path.basename(jsonFile) } });
    // add meta.json in zip
    configs.push({ from: metaJson, as: path.basename(metaJson) });
    // exec zip
    const zipFile = await this.zipFiles(configs);

    // get stats for the zip file
    return this.growiBridgeService.parseZipFile(zipFile);

    // TODO: remove broken zip file
  }

  /**
   * log export progress
   *
   * @memberOf ExportService
   *
   * @param {ExportStatus} exportStatus
   * @param {ExportProgress} exportProgress
   * @param {number} currentCount number of items exported
   */
  logProgress(exportStatus, exportProgress, currentCount) {
    const output = `${exportProgress.collectionName}: ${currentCount}/${exportProgress.totalCount} written`;

    // update exportProgress.currentCount
    exportProgress.currentCount = currentCount;

    // output every this.per items
    if (currentCount % this.per === 0) {
      logger.debug(output);
      this.emitProgressEvent(exportStatus, exportProgress);
    }
    // output last item
    else if (currentCount === exportProgress.totalCount) {
      logger.info(output);
      this.emitProgressEvent(exportStatus, exportProgress);
    }
  }

  /**
   * emit progress event
   * @param {ExportStatus} exportStatus
   * @param {ExportProgress} exportProgress
   */
  emitProgressEvent(exportStatus, exportProgress) {
    const globalCurrentCount = exportStatus.currentCount;

    const globalTotalCount = exportStatus.totalCount;

    // send event (in progress in global)
    if (globalCurrentCount !== globalTotalCount) {
      this.adminEvent.emit('onProgressForExport', globalTotalCount, globalCurrentCount);
    }
    else {
      this.adminEvent.emit('onTerminateForExport');
    }
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
