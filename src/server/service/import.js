const logger = require('@alias/logger')('growi:services:ImportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');

const { Writable, Transform } = require('stream');
const JSONStream = require('JSONStream');
const streamToPromise = require('stream-to-promise');
const unzipper = require('unzipper');

const { ObjectId } = require('mongoose').Types;

const { createBatchStream } = require('../util/batch-stream');
const CollectionProgressingStatus = require('../models/vo/collection-progressing-status');


const BULK_IMPORT_SIZE = 100;


class ImportOptions {

  constructor(mode) {
    this.mode = mode || 'insert';
    this.jsonFileName = null;
    this.overwriteParams = null;
  }

}

class ImportService {

  constructor(crowi) {
    this.crowi = crowi;
    this.growiBridgeService = crowi.growiBridgeService;
    this.getFile = this.growiBridgeService.getFile.bind(this);
    this.baseDir = path.join(crowi.tmpDir, 'imports');
    this.keepOriginal = this.keepOriginal.bind(this);

    this.adminEvent = crowi.event('admin');

    // { pages: { _id: ..., path: ..., ...}, users: { _id: ..., username: ..., }, ... }
    this.convertMap = {};
    this.initConvertMap(crowi.models);

    this.currentProgressingStatus = null;
  }

  /**
   * generate ImportOptions instance
   * @param {string} mode bulk operation mode (insert | upsert | flushAndInsert)
   */
  generateImportOptions(mode) {
    return new ImportOptions(mode);
  }

  /**
   * initialize convert map. set keepOriginal as default
   *
   * @memberOf ImportService
   * @param {object} models from models/index.js
   */
  initConvertMap(models) {
    // by default, original value is used for imported documents
    for (const model of Object.values(models)) {
      if (model.collection == null) {
        continue;
      }

      const collectionName = model.collection.name;
      this.convertMap[collectionName] = {};

      for (const key of Object.keys(model.schema.paths)) {
        this.convertMap[collectionName][key] = this.keepOriginal;
      }
    }
  }

  /**
   * keep original value
   * automatically convert ObjectId
   *
   * @memberOf ImportService
   * @param {any} _value value from imported document
   * @param {{ _document: object, schema: object, key: string }}
   * @return {any} new value for the document
   */
  keepOriginal(_value, { _document, schema, key }) {
    let value;
    if (schema[key].instance === 'ObjectID' && ObjectId.isValid(_value)) {
      value = ObjectId(_value);
    }
    else {
      value = _value;
    }

    return value;
  }

  /**
   * parse all zip files in downloads dir
   *
   * @memberOf ExportService
   * @return {object} info for zip files and whether currentProgressingStatus exists
   */
  async getStatus() {
    const zipFiles = fs.readdirSync(this.baseDir).filter(file => path.extname(file) === '.zip');
    const zipFileStats = await Promise.all(zipFiles.map((file) => {
      const zipFile = this.getFile(file);
      return this.growiBridgeService.parseZipFile(zipFile);
    }));

    // filter null object (broken zip)
    const filtered = zipFileStats
      .filter(zipFileStat => zipFileStat != null);
    // sort with ctime("Change Time" - Time when file status was last changed (inode data modification).)
    filtered.sort((a, b) => { return a.fileStat.ctime - b.fileStat.ctime });

    const isImporting = this.currentProgressingStatus != null;

    return {
      zipFileStat: filtered.pop(),
      isImporting,
      progressList: isImporting ? this.currentProgressingStatus.progressList : null,
    };
  }

  /**
   * import collections from json
   *
   * @param {string} collections MongoDB collection name
   * @param {array} importOptionsMap key: collection name, value: ImportOptions instance
   */
  async import(collections, importOptionsMap) {
    // init status object
    this.currentProgressingStatus = new CollectionProgressingStatus(collections);

    try {
      const promises = collections.map((collectionName) => {
        const importOptions = importOptionsMap[collectionName];
        return this.importCollection(collections, importOptions);
      });
      await Promise.all(promises);
    }
    finally {
      this.currentProgressingStatus = null;
    }
  }

  /**
   * import a collection from json
   *
   * @memberOf ImportService
   * @param {string} collectionName MongoDB collection name
   * @param {ImportOptions} importOptions
   * @return {insertedIds: Array.<string>, failedIds: Array.<string>}
   */
  async importCollection(collectionName, importOptions) {
    // prepare functions invoked from custom streams
    const convertDocuments = this.convertDocuments.bind(this);
    const bulkOperate = this.bulkOperate.bind(this);
    const execUnorderedBulkOpSafely = this.execUnorderedBulkOpSafely.bind(this);
    const emitProgressEvent = this.emitProgressEvent.bind(this);
    const emitTerminateEvent = this.emitTerminateEvent.bind(this);

    const { jsonFileName, overwriteParams } = importOptions;
    const Model = this.growiBridgeService.getModelFromCollectionName(collectionName);
    const jsonFile = this.getFile(jsonFileName);
    const collectionProgress = this.currentProgressingStatus.progressMap[collectionName];

    // stream 1
    const readStream = fs.createReadStream(jsonFile, { encoding: this.growiBridgeService.getEncoding() });

    // stream 2
    const jsonStream = JSONStream.parse('*');

    // stream 3
    const convertStream = new Transform({
      objectMode: true,
      transform(doc, encoding, callback) {
        const converted = convertDocuments(Model, doc, overwriteParams);
        this.push(converted);
        callback();
      },
    });

    // stream 4
    const batchStream = createBatchStream(BULK_IMPORT_SIZE);

    // stream 5
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        const unorderedBulkOp = Model.collection.initializeUnorderedBulkOp();

        // documents are not persisted until unorderedBulkOp.execute()
        batch.forEach((document) => {
          bulkOperate(unorderedBulkOp, collectionName, document, importOptions);
        });

        // exec
        const { insertedCount, modifiedCount, errors } = await execUnorderedBulkOpSafely(unorderedBulkOp);
        logger.debug(`Importing ${collectionName}. Inserted: ${insertedCount}. Modified: ${modifiedCount}. Failed: ${errors.length}.`);

        const increment = insertedCount + modifiedCount + errors.length;
        collectionProgress.currentCount += increment;
        collectionProgress.totalCount += increment;
        collectionProgress.insertedCount += insertedCount;
        collectionProgress.modifiedCount += modifiedCount;

        emitProgressEvent(collectionName, collectionProgress, errors);

        callback();
      },
      final(callback) {
        // TODO: logger.info

        emitTerminateEvent();

        callback();
      },
    });

    readStream
      .pipe(jsonStream)
      .pipe(convertStream)
      .pipe(batchStream)
      .pipe(writeStream);

    await streamToPromise(writeStream);

    // clean up tmp directory
    fs.unlinkSync(jsonFile);
  }

  /**
   * process bulk operation
   * @param {object} bulk MongoDB Bulk instance
   * @param {string} collectionName collection name
   * @param {object} document
   * @param {ImportOptions} importOptions
   */
  bulkOperate(bulk, collectionName, document, importOptions) {
    // insert
    if (importOptions.mode !== 'upsert') {
      return bulk.insert(document);
    }

    // upsert
    switch (collectionName) {
      default:
        return bulk.find({ _id: document._id }).upsert().replaceOne(document);
    }
  }

  /**
   * emit progress event
   * @param {object} appendedErrors key: collection name, value: array of error object
   */
  emitProgressEvent(collectionName, collectionProgress, appendedErrors) {
    // send event (in progress in global)
    this.adminEvent.emit('onProgressForImport', { collectionName, collectionProgress, appendedErrors });
  }

  /**
   * emit terminate event
   */
  emitTerminateEvent() {
    this.adminEvent.emit('onTerminateForImport');
  }

  /**
   * extract a zip file
   *
   * @memberOf ImportService
   * @param {string} zipFile absolute path to zip file
   * @return {Array.<string>} array of absolute paths to extracted files
   */
  async unzip(zipFile) {
    const readStream = fs.createReadStream(zipFile);
    const unzipStream = readStream.pipe(unzipper.Parse());
    const files = [];

    unzipStream.on('entry', (entry) => {
      const fileName = entry.path;

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

  /**
   * execute unorderedBulkOp and ignore errors
   *
   * @memberOf ImportService
   * @param {object} unorderedBulkOp result of Model.collection.initializeUnorderedBulkOp()
   * @return {object} e.g. { insertedCount: 10, errors: [...] }
   */
  async execUnorderedBulkOpSafely(unorderedBulkOp) {
    let errors = [];
    let result = null;

    try {
      const log = await unorderedBulkOp.execute();
      result = log.result;
    }
    catch (err) {
      result = err.result;
      errors = err.writeErrors.map((err) => {
        const moreDetailErr = err.err;
        return { _id: moreDetailErr.op._id, message: err.errmsg };
      });
    }

    const insertedCount = result.nInserted + result.nUpserted;
    const modifiedCount = result.nModified;

    return {
      insertedCount,
      modifiedCount,
      errors,
    };
  }

  /**
   * execute unorderedBulkOp and ignore errors
   *
   * @memberOf ImportService
   * @param {object} Model instance of mongoose model
   * @param {object} _document document being imported
   * @param {object} overwriteParams overwrite each document with unrelated value. e.g. { creator: req.user }
   * @return {object} document to be persisted
   */
  convertDocuments(Model, _document, overwriteParams) {
    const collectionName = Model.collection.name;
    const schema = Model.schema.paths;
    const convertMap = this.convertMap[collectionName];

    if (convertMap == null) {
      throw new Error(`attribute map is not defined for ${collectionName}`);
    }

    const document = {};

    // assign value from documents being imported
    for (const entry of Object.entries(convertMap)) {
      const [key, value] = entry;

      // distinguish between null and undefined
      if (_document[key] === undefined) {
        continue; // next entry
      }

      document[key] = (typeof value === 'function') ? value(_document[key], { _document, key, schema }) : value;
    }

    // overwrite documents with custom values
    for (const entry of Object.entries(overwriteParams)) {
      const [key, value] = entry;

      // distinguish between null and undefined
      if (_document[key] !== undefined) {
        document[key] = (typeof value === 'function') ? value(_document[key], { _document, key, schema }) : value;
      }
    }

    return document;
  }

  /**
   * validate using meta.json
   * to pass validation, all the criteria must be met
   *   - ${version of this growi} === ${version of growi that exported data}
   *
   * @memberOf ImportService
   * @param {object} meta meta data from meta.json
   */
  validate(meta) {
    if (meta.version !== this.crowi.version) {
      throw new Error('the version of this growi and the growi that exported the data are not met');
    }

    // TODO: check if all migrations are completed
    // - export: throw err if there are pending migrations
    // - import: throw err if there are pending migrations
  }

  /**
   * Delete all uploaded files
   */
  deleteAllZipFiles() {
    fs.readdirSync(this.baseDir)
      .filter(file => path.extname(file) === '.zip')
      .forEach(file => fs.unlinkSync(path.join(this.baseDir, file)));
  }

}

module.exports = ImportService;
