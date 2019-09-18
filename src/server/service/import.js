const logger = require('@alias/logger')('growi:services:ImportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');
const streamToPromise = require('stream-to-promise');
const unzip = require('unzipper');
const { ObjectId } = require('mongoose').Types;

class ImportService {

  constructor(crowi) {
    this.baseDir = path.join(crowi.tmpDir, 'imports');
    this.encoding = 'utf-8';
    this.per = 100;
    this.keepOriginal = this.keepOriginal.bind(this);

    // { pages: Page, users: User, ... }
    this.collectionMap = {};
    this.initCollectionMap(crowi.models);

    // { pages: { _id: ..., path: ..., ...}, users: { _id: ..., username: ..., }, ... }
    this.convertMap = {};
    this.initConvertMap(crowi.models);
  }

  /**
   * initialize collection map
   *
   * @memberOf ImportService
   * @param {object} models from models/index.js
   */
  initCollectionMap(models) {
    for (const model of Object.values(models)) {
      this.collectionMap[model.collection.collectionName] = model;
    }
  }

  /**
   * initialize convert map
   *
   * @memberOf ImportService
   * @param {object} models from models/index.js
   */
  initConvertMap(models) {
    // by default, original value is used for imported documents
    for (const model of Object.values(models)) {
      this.convertMap[model.collection.collectionName] = {};
      for (const key of Object.keys(model.schema.paths)) {
        this.convertMap[model.collection.collectionName][key] = this.keepOriginal;
      }
    }
  }

  /**
   * keep original value
   * automatically convert ObjectId
   *
   * @memberOf ImportService
   * @param {array<object>} _value value from imported document
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

  getConvertMap(collectionName) {
    const convertMap = {};

    // each key accepts either function or hardcoded value
    // 1. to keep the same value => unlist the key
    // 2. to filter out an attribute, explicitly set it to undefined. e.g. "[key]: undefined"
    if (collectionName === 'pages') {
      Object.assign(convertMap, {
        status: 'published', // FIXME when importing users and user groups
        grant: 1, // FIXME when importing users and user groups
        grantedUsers: [], // FIXME when importing users and user groups
        grantedGroup: null, // FIXME when importing users and user groups
        liker: [], // FIXME when importing users
        seenUsers: [], // FIXME when importing users
        commentCount: 0, // FIXME when importing comments
        extended: {}, // FIXME when ?
        pageIdOnHackmd: undefined, // FIXME when importing hackmd?
        revisionHackmdSynced: undefined, // FIXME when importing hackmd?
        hasDraftOnHackmd: undefined, // FIXME when importing hackmd?
      });
    }

    return convertMap;
  }

  /**
   * import a collection from json
   *
   * @memberOf ImportService
   * @param {object} Model instance of mongoose model
   * @param {string} filePath path to zipped json
   * @param {object} overwriteParams overwrite each document with unrelated value. e.g. { creator: req.user }
   */
  async importFromZip(Model, filePath, overwriteParams = {}) {
    const { collectionName } = Model.collection;

    // extract zip file
    await this.unzip(filePath);

    let counter = 0;
    let nInsertedTotal = 0;

    let failedIds = [];
    let unorderedBulkOp = Model.collection.initializeUnorderedBulkOp();

    const tmpJson = path.join(this.baseDir, `${collectionName}.json`);
    const readStream = fs.createReadStream(tmpJson, { encoding: this.encoding });
    const jsonStream = readStream.pipe(JSONStream.parse('*'));

    jsonStream.on('data', async(document) => {
      // documents are not persisted until unorderedBulkOp.execute()
      unorderedBulkOp.insert(this.convertDocuments(Model, document, overwriteParams));

      counter++;

      if (counter % this.per === 0) {
        // puase jsonStream to prevent more items to be added to unorderedBulkOp
        jsonStream.pause();

        const { nInserted, failed } = await this.execUnorderedBulkOpSafely(unorderedBulkOp);
        nInsertedTotal += nInserted;
        failedIds = [...failedIds, ...failed];

        // reset initializeUnorderedBulkOp
        unorderedBulkOp = Model.collection.initializeUnorderedBulkOp();

        // resume jsonStream
        jsonStream.resume();
      }
    });

    jsonStream.on('end', async(data) => {
      // insert the rest. avoid errors when unorderedBulkOp has no items
      if (unorderedBulkOp.s.currentBatch !== null) {
        const { nInserted, failed } = await this.execUnorderedBulkOpSafely(unorderedBulkOp);
        nInsertedTotal += nInserted;
        failedIds = [...failedIds, ...failed];
      }

      logger.info(`Done. Inserted ${nInsertedTotal} ${collectionName}.`);

      if (failedIds.length > 0) {
        logger.error(`Failed to insert ${failedIds.length} ${collectionName}: ${failedIds.join(', ')}.`);
      }
    });

    // streamToPromise(jsonStream) throws error, so await readStream instead
    await streamToPromise(readStream);

    // clean up tmp directory
    fs.unlinkSync(tmpJson);
  }

  /**
   * extract a zip file
   *
   * @memberOf ImportService
   * @param {string} zipFilePath path to zip file
   */
  unzip(zipFilePath) {
    return new Promise((resolve, reject) => {
      const unzipStream = fs.createReadStream(zipFilePath).pipe(unzip.Extract({ path: this.baseDir }));
      unzipStream.on('error', (err) => {
        reject(err);
      });
      unzipStream.on('close', () => {
        resolve();
      });
    });
  }

  /**
   * execute unorderedBulkOp and ignore errors
   *
   * @memberOf ImportService
   * @param {object} unorderedBulkOp result of Model.collection.initializeUnorderedBulkOp()
   * @return {{nInserted: number, failed: string[]}} number of docuemnts inserted and failed
   */
  async execUnorderedBulkOpSafely(unorderedBulkOp) {
    // keep the number of documents inserted and failed for logger
    let nInserted = 0;
    const failed = [];

    // try catch to skip errors
    try {
      const log = await unorderedBulkOp.execute();
      nInserted = log.result.nInserted;
    }
    catch (err) {
      for (const error of err.result.result.writeErrors) {
        logger.error(error.errmsg);
        failed.push(error.err.op._id);
      }

      nInserted = err.result.result.nInserted;
    }

    logger.debug(`Importing ${unorderedBulkOp.s.collection.s.name}. Inserted: ${nInserted}. Failed: ${failed.length}.`);

    return {
      nInserted,
      failed,
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
    const collectionName = Model.collection.collectionName;
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
   * get a model from collection name
   *
   * @memberOf ImportService
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

module.exports = ImportService;
