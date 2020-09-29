const logger = require('@alias/logger')('growi:services:ImportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');

const isIsoDate = require('is-iso-date');
const parseISO = require('date-fns/parseISO');

const { Writable, Transform } = require('stream');
const JSONStream = require('JSONStream');
const streamToPromise = require('stream-to-promise');
const unzipper = require('unzipper');

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const { createBatchStream } = require('../util/batch-stream');
const CollectionProgressingStatus = require('../models/vo/collection-progressing-status');


const BULK_IMPORT_SIZE = 100;


class ImportSettings {

  constructor(mode) {
    this.mode = mode || 'insert';
    this.jsonFileName = null;
    this.overwriteParams = null;
  }

}

class ImportingCollectionError extends Error {

  constructor(collectionProgress, error) {
    super(error);
    this.collectionProgress = collectionProgress;
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
   * generate ImportSettings instance
   * @param {string} mode bulk operation mode (insert | upsert | flushAndInsert)
   */
  generateImportSettings(mode) {
    return new ImportSettings(mode);
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
   * @param {any} value value from imported document
   * @param {{ document: object, schema: object, propertyName: string }}
   * @return {any} new value for the document
   *
   * @see https://mongoosejs.com/docs/api/schematype.html#schematype_SchemaType-cast
   */
  keepOriginal(value, { document, schema, propertyName }) {
    // Model
    if (schema != null && schema.path(propertyName) != null) {
      const schemaType = schema.path(propertyName);
      return schemaType.cast(value);
    }

    // _id
    if (propertyName === '_id' && ObjectId.isValid(value)) {
      return ObjectId(value);
    }

    // Date
    if (isIsoDate(value)) {
      return parseISO(value);
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

    // process serially so as not to waste memory
    const zipFileStats = [];
    const parseZipFilePromises = zipFiles.map((file) => {
      const zipFile = this.getFile(file);
      return this.growiBridgeService.parseZipFile(zipFile);
    });
    for await (const stat of parseZipFilePromises) {
      zipFileStats.push(stat);
    }

    // filter null object (broken zip)
    const filtered = zipFileStats
      .filter(zipFileStat => zipFileStat != null);
    // sort with ctime("Change Time" - Time when file status was last changed (inode data modification).)
    filtered.sort((a, b) => { return a.fileStat.ctime - b.fileStat.ctime });

    const isImporting = this.currentProgressingStatus != null;

    const zipFileStat = filtered.pop();
    let isTheSameVersion = false;

    if (zipFileStat != null) {
      try {
        this.validate(zipFileStat.meta);
        isTheSameVersion = true;
      }
      catch (err) {
        isTheSameVersion = false;
        logger.error('the versions are not met', err);
      }
    }


    return {
      isTheSameVersion,
      zipFileStat,
      isImporting,
      progressList: isImporting ? this.currentProgressingStatus.progressList : null,
    };
  }

  /**
   * import collections from json
   *
   * @param {string} collections MongoDB collection name
   * @param {array} importSettingsMap key: collection name, value: ImportSettings instance
   */
  async import(collections, importSettingsMap) {
    // init status object
    this.currentProgressingStatus = new CollectionProgressingStatus(collections);

    // process serially so as not to waste memory
    const promises = collections.map((collectionName) => {
      const importSettings = importSettingsMap[collectionName];
      return this.importCollection(collectionName, importSettings);
    });
    for await (const promise of promises) {
      try {
        await promise;
      }
      // catch ImportingCollectionError
      catch (err) {
        const { collectionProgress } = err;
        logger.error(`failed to import to ${collectionProgress.collectionName}`, err);
        this.emitProgressEvent(collectionProgress, { message: err.message });
      }
    }

    this.currentProgressingStatus = null;
    this.emitTerminateEvent();
  }

  /**
   * import a collection from json
   *
   * @memberOf ImportService
   * @param {string} collectionName MongoDB collection name
   * @param {ImportSettings} importSettings
   * @return {insertedIds: Array.<string>, failedIds: Array.<string>}
   */
  async importCollection(collectionName, importSettings) {
    // prepare functions invoked from custom streams
    const convertDocuments = this.convertDocuments.bind(this);
    const bulkOperate = this.bulkOperate.bind(this);
    const execUnorderedBulkOpSafely = this.execUnorderedBulkOpSafely.bind(this);
    const emitProgressEvent = this.emitProgressEvent.bind(this);

    const collection = mongoose.connection.collection(collectionName);

    const { mode, jsonFileName, overwriteParams } = importSettings;
    const collectionProgress = this.currentProgressingStatus.progressMap[collectionName];

    try {
      const jsonFile = this.getFile(jsonFileName);

      // validate options
      this.validateImportSettings(collectionName, importSettings);

      // flush
      if (mode === 'flushAndInsert') {
        await collection.deleteMany({});
      }

      // stream 1
      const readStream = fs.createReadStream(jsonFile, { encoding: this.growiBridgeService.getEncoding() });

      // stream 2
      const jsonStream = JSONStream.parse('*');

      // stream 3
      const convertStream = new Transform({
        objectMode: true,
        transform(doc, encoding, callback) {
          const converted = convertDocuments(collectionName, doc, overwriteParams);
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
          const unorderedBulkOp = collection.initializeUnorderedBulkOp();

          // documents are not persisted until unorderedBulkOp.execute()
          batch.forEach((document) => {
            bulkOperate(unorderedBulkOp, collectionName, document, importSettings);
          });

          // exec
          const { insertedCount, modifiedCount, errors } = await execUnorderedBulkOpSafely(unorderedBulkOp);
          logger.debug(`Importing ${collectionName}. Inserted: ${insertedCount}. Modified: ${modifiedCount}. Failed: ${errors.length}.`);

          const increment = insertedCount + modifiedCount + errors.length;
          collectionProgress.currentCount += increment;
          collectionProgress.totalCount += increment;
          collectionProgress.insertedCount += insertedCount;
          collectionProgress.modifiedCount += modifiedCount;

          emitProgressEvent(collectionProgress, errors);

          callback();
        },
        final(callback) {
          logger.info(`Importing ${collectionName} has completed.`);
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
    catch (err) {
      throw new ImportingCollectionError(collectionProgress, err);
    }

  }

  /**
   *
   * @param {string} collectionName
   * @param {importSettings} importSettings
   */
  validateImportSettings(collectionName, importSettings) {
    const { mode } = importSettings;

    switch (collectionName) {
      case 'configs':
        if (mode !== 'flushAndInsert') {
          throw new Error(`The specified mode '${mode}' is not allowed when importing to 'configs' collection.`);
        }
        break;
    }
  }

  /**
   * process bulk operation
   * @param {object} bulk MongoDB Bulk instance
   * @param {string} collectionName collection name
   * @param {object} document
   * @param {ImportSettings} importSettings
   */
  bulkOperate(bulk, collectionName, document, importSettings) {
    // insert
    if (importSettings.mode !== 'upsert') {
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
   * @param {CollectionProgress} collectionProgress
   * @param {object} appendedErrors key: collection name, value: array of error object
   */
  emitProgressEvent(collectionProgress, appendedErrors) {
    const { collectionName } = collectionProgress;

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
      errors = err.writeErrors || [err];
      errors.map((err) => {
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
   * @param {string} collectionName
   * @param {object} document document being imported
   * @param {object} overwriteParams overwrite each document with unrelated value. e.g. { creator: req.user }
   * @return {object} document to be persisted
   */
  convertDocuments(collectionName, document, overwriteParams) {
    const Model = this.growiBridgeService.getModelFromCollectionName(collectionName);
    const schema = (Model != null) ? Model.schema : null;
    const convertMap = this.convertMap[collectionName];

    const _document = {};

    // not Mongoose Model
    if (convertMap == null) {
      // apply keepOriginal to all of properties
      Object.entries(document).forEach(([propertyName, value]) => {
        _document[propertyName] = this.keepOriginal(value, { document, propertyName });
      });
    }
    // Mongoose Model
    else {
      // assign value from documents being imported
      Object.entries(convertMap).forEach(([propertyName, convertedValue]) => {
        const value = document[propertyName];

        // distinguish between null and undefined
        if (value === undefined) {
          return; // next entry
        }

        const convertFunc = (typeof convertedValue === 'function') ? convertedValue : null;
        _document[propertyName] = (convertFunc != null) ? convertFunc(value, { document, propertyName, schema }) : convertedValue;
      });
    }

    // overwrite documents with custom values
    Object.entries(overwriteParams).forEach(([propertyName, overwriteValue]) => {
      const value = document[propertyName];

      // distinguish between null and undefined
      if (value !== undefined) {
        const overwriteFunc = (typeof overwriteValue === 'function') ? overwriteValue : null;
        _document[propertyName] = (overwriteFunc != null) ? overwriteFunc(value, { document: _document, propertyName, schema }) : overwriteValue;
      }
    });

    return _document;
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
