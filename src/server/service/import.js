const logger = require('@alias/logger')('growi:services:ImportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');

const { Writable, Transform } = require('stream');
const JSONStream = require('JSONStream');
const streamToPromise = require('stream-to-promise');
const unzipper = require('unzipper');

const { ObjectId } = require('mongoose').Types;

const { createBatchStream } = require('../util/batch-stream');

const BULK_IMPORT_SIZE = 100;

class ImportService {

  constructor(crowi) {
    this.crowi = crowi;
    this.growiBridgeService = crowi.growiBridgeService;
    this.getFile = this.growiBridgeService.getFile.bind(this);
    this.baseDir = path.join(crowi.tmpDir, 'imports');
    this.keepOriginal = this.keepOriginal.bind(this);

    // { pages: { _id: ..., path: ..., ...}, users: { _id: ..., username: ..., }, ... }
    this.convertMap = {};
    this.initConvertMap(crowi.models);

    this.currentProgressingStatus = null;
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
   * import a collection from json
   *
   * @memberOf ImportService
   * @param {object} Model instance of mongoose model
   * @param {string} jsonFile absolute path to the jsonFile being imported
   * @param {object} overwriteParams overwrite each document with unrelated value. e.g. { creator: req.user }
   * @return {insertedIds: Array.<string>, failedIds: Array.<string>}
   */
  async import(Model, jsonFile, overwriteParams = {}) {
    // prepare functions invoked from custom streams
    const convertDocuments = this.convertDocuments.bind(this);
    const execUnorderedBulkOpSafely = this.execUnorderedBulkOpSafely.bind(this);

    const readStream = fs.createReadStream(jsonFile, { encoding: this.growiBridgeService.getEncoding() });

    const jsonStream = JSONStream.parse('*');

    const convertStream = new Transform({
      objectMode: true,
      transform(doc, encoding, callback) {
        const converted = convertDocuments(Model, doc, overwriteParams);
        this.push(converted);
        callback();
      },
    });

    const batchStream = createBatchStream(BULK_IMPORT_SIZE);

    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        const unorderedBulkOp = Model.collection.initializeUnorderedBulkOp();

        // documents are not persisted until unorderedBulkOp.execute()
        batch.forEach((document) => {
          unorderedBulkOp.insert(document);
        });

        // exec
        // eslint-disable-next-line no-unused-vars
        const { insertedIds, failedIds } = await execUnorderedBulkOpSafely(unorderedBulkOp);

        // TODO: emit event

        callback();
      },
      final(callback) {
        // TODO: logger.info
        // TODO: emit event

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
   * @return {{nInserted: number, failed: Array.<string>}} number of docuemnts inserted and failed
   */
  async execUnorderedBulkOpSafely(unorderedBulkOp) {
    // keep the number of documents inserted and failed for logger
    let insertedIds = [];
    let failedIds = [];

    // try catch to skip errors
    try {
      const log = await unorderedBulkOp.execute();
      const _insertedIds = log.result.insertedIds.map(op => op._id);
      insertedIds = [...insertedIds, ..._insertedIds];
    }
    catch (err) {
      const collectionName = unorderedBulkOp.s.namespace;

      for (const error of err.result.result.writeErrors) {
        logger.error(`${collectionName}: ${error.errmsg}`);
      }

      const _failedIds = err.result.result.writeErrors.map(err => err.err.op._id);
      const _insertedIds = err.result.result.insertedIds.filter(op => !_failedIds.includes(op._id)).map(op => op._id);

      failedIds = [...failedIds, ..._failedIds];
      insertedIds = [...insertedIds, ..._insertedIds];
    }

    logger.debug(`Importing ${unorderedBulkOp.s.collection.s.name}. Inserted: ${insertedIds.length}. Failed: ${failedIds.length}.`);

    return {
      insertedIds,
      failedIds,
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
